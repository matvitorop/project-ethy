using FluentAssertions;
using Microsoft.AspNetCore.SignalR.Client;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace server.IntegrationTests
{
    [Collection("Integration Tests")]
    public class ChatAndStagesTests : IntegrationTestBase
    {
        public ChatAndStagesTests(CustomWebApplicationFactory factory) : base(factory)
        {
        }

        private HubConnection CreateHubConnection(string token)
        {
            return new HubConnectionBuilder()
                .WithUrl("http://localhost/hubs/chat", options =>
                {
                    options.HttpMessageHandlerFactory = _ => _factory.Server.CreateHandler();
                    options.AccessTokenProvider = () => Task.FromResult(token)!;
                })
                .Build();
        }

        [Fact]
        public async Task Chat_And_Stages_ShouldWorkViaSignalR()
        {
            var creator = await RegisterAndLoginAsync("chat_creator", "chat_creator@test.com", "Password123!");
            var volunteer = await RegisterAndLoginAsync("chat_vol", "chat_vol@test.com", "Password123!");

            var helpRequestId = await CreateHelpRequestAsync(creator.Token, "Test Title", "Test Desc");
            await ApproveHelpRequestAsync(helpRequestId);

            // Volunteer responds
            var respondMutation = @"
                mutation Respond($id: ID!, $message: String!) {
                    helpRequest {
                        respondToHelpRequest(helpRequestId: $id, message: $message) { error { code } }
                    }
                }";
            await SendGraphQLAsync(respondMutation, new { id = helpRequestId.ToString(), message = "Help" }, volunteer.Token);

            var candidatesQuery = @"
                query GetCandidates($id: ID!) {
                    helpRequestQuer {
                        helpRequestResponses(helpRequestId: $id) {
                            items { id }
                        }
                    }
                }";
            var candidatesResult = await SendGraphQLAsync(candidatesQuery, new { id = helpRequestId.ToString() }, creator.Token);
            var responseId = candidatesResult.GetProperty("data").GetProperty("helpRequestQuer").GetProperty("helpRequestResponses").GetProperty("items")[0].GetProperty("id").GetString()!;

            // Assign
            var assignMutation = @"
                mutation Assign($hrId: ID!, $respId: ID!) {
                    helpRequest {
                        assignExecutor(helpRequestId: $hrId, responseId: $respId) { error { code } }
                    }
                }";
            await SendGraphQLAsync(assignMutation, new { hrId = helpRequestId.ToString(), respId = responseId }, creator.Token);

            // Connect to SignalR
            await using var creatorConn = CreateHubConnection(creator.Token);
            await using var volunteerConn = CreateHubConnection(volunteer.Token);

            await creatorConn.StartAsync();
            await volunteerConn.StartAsync();

            await creatorConn.InvokeAsync("JoinChat", helpRequestId.ToString());
            await volunteerConn.InvokeAsync("JoinChat", helpRequestId.ToString());

            // Listen for messages
            string? receivedMessage = null;
            Guid? receivedStageId = null;

            var tcsMsg = new TaskCompletionSource<bool>();
            var tcsStage = new TaskCompletionSource<bool>();
            var tcsConfirm = new TaskCompletionSource<bool>();

            volunteerConn.On<object>("ReceiveMessage", msg =>
            {
                receivedMessage = JsonSerializer.Serialize(msg);
                tcsMsg.TrySetResult(true);
            });

            volunteerConn.On<object>("StageProposed", msg =>
            {
                var dict = JsonSerializer.Deserialize<JsonElement>(JsonSerializer.Serialize(msg));
                receivedStageId = Guid.Parse(dict.GetProperty("stageId").GetString()!);
                tcsStage.TrySetResult(true);
            });

            creatorConn.On<object>("StageConfirmed", msg =>
            {
                tcsConfirm.TrySetResult(true);
            });

            // 1. Send Message
            await creatorConn.InvokeAsync("SendMessage", helpRequestId.ToString(), "Hello volunteer");
            var msgReceived = await Task.WhenAny(tcsMsg.Task, Task.Delay(5000));
            msgReceived.Should().Be(tcsMsg.Task, "Message should be received within 5 seconds");
            receivedMessage.Should().Contain("Hello volunteer");

            // Get Chat ID
            var chatQuery = @"
                query {
                    helpRequestQuer {
                        myChats {
                            items { chatId }
                        }
                    }
                }";
            var chatResult = await SendGraphQLAsync(chatQuery, null, creator.Token);
            var chatId = chatResult.GetProperty("data").GetProperty("helpRequestQuer").GetProperty("myChats").GetProperty("items")[0].GetProperty("chatId").GetString()!;

            // 2. Propose Stage
            await creatorConn.InvokeAsync("ProposeStage", helpRequestId.ToString(), chatId, "First Stage");
            var stageReceived = await Task.WhenAny(tcsStage.Task, Task.Delay(5000));
            stageReceived.Should().Be(tcsStage.Task, "Stage should be received within 5 seconds");
            receivedStageId.Should().NotBeNull();

            // 3. Confirm Stage
            await volunteerConn.InvokeAsync("ConfirmStage", helpRequestId.ToString(), receivedStageId.ToString());
            var confirmReceived = await Task.WhenAny(tcsConfirm.Task, Task.Delay(5000));
            confirmReceived.Should().Be(tcsConfirm.Task, "Confirmation should be received within 5 seconds");

            await creatorConn.StopAsync();
            await volunteerConn.StopAsync();
        }
    }
}
