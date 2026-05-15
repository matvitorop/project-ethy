using FluentAssertions;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace server.IntegrationTests
{
    [Collection("Integration Tests")]
    public class HelpRequestAssigneeManagementTests : IntegrationTestBase
    {
        public HelpRequestAssigneeManagementTests(CustomWebApplicationFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task Candidate_CanCancelResponse_ShouldWork()
        {
            var creator = await RegisterAndLoginAsync("creator_c", "creator_c@test.com", "Password123!");
            var volunteer = await RegisterAndLoginAsync("volunteer_c", "volunteer_c@test.com", "Password123!");

            var helpRequestId = await CreateHelpRequestAsync(creator.Token, "Test Title", "Test Desc");
            await ApproveHelpRequestAsync(helpRequestId);

            // Volunteer responds
            var respondMutation = @"
                mutation Respond($id: ID!, $message: String!) {
                    helpRequest {
                        respondToHelpRequest(helpRequestId: $id, message: $message) {
                            error { code message }
                        }
                    }
                }";
            await SendGraphQLAsync(respondMutation, new { id = helpRequestId.ToString(), message = "I want to help" }, volunteer.Token);

            // Volunteer cancels response
            var cancelRespMutation = @"
                mutation CancelResp($id: ID!) {
                    helpRequest {
                        cancelResponse(helpRequestId: $id) {
                            error { code message }
                        }
                    }
                }";
            var cancelResult = await SendGraphQLAsync(cancelRespMutation, new { id = helpRequestId.ToString() }, volunteer.Token);
            var cancelError = cancelResult.GetProperty("data").GetProperty("helpRequest").GetProperty("cancelResponse").GetProperty("error");
            if (cancelError.ValueKind != JsonValueKind.Null) throw new Exception($"Cancel Response failed: {cancelError.ToString()}");

            // Verify candidate list has the response with status CANCELLED
            var candidatesQuery = @"
                query GetCandidates($id: ID!) {
                    helpRequestQuer {
                        helpRequestResponses(helpRequestId: $id) {
                            items { id status }
                        }
                    }
                }";
            var candidatesResult = await SendGraphQLAsync(candidatesQuery, new { id = helpRequestId.ToString() }, creator.Token);
            var items = candidatesResult.GetProperty("data").GetProperty("helpRequestQuer").GetProperty("helpRequestResponses").GetProperty("items");
            items.GetArrayLength().Should().Be(1);
            items[0].GetProperty("status").GetInt32().Should().Be(3);
        }

        [Fact]
        public async Task AssignedExecutor_CanResign_ShouldWork()
        {
            var creator = await RegisterAndLoginAsync("creator_r", "creator_r@test.com", "Password123!");
            var volunteer = await RegisterAndLoginAsync("volunteer_r", "volunteer_r@test.com", "Password123!");

            var helpRequestId = await CreateHelpRequestAsync(creator.Token, "Test Title", "Test Desc");
            await ApproveHelpRequestAsync(helpRequestId);

            // Respond
            var respondMutation = @"
                mutation Respond($id: ID!, $message: String!) {
                    helpRequest {
                        respondToHelpRequest(helpRequestId: $id, message: $message) { error { code } }
                    }
                }";
            await SendGraphQLAsync(respondMutation, new { id = helpRequestId.ToString(), message = "Help" }, volunteer.Token);

            // Get response id
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

            // Resign
            var resignMutation = @"
                mutation Resign($hrId: ID!, $reason: String!) {
                    helpRequest {
                        resignAsExecutor(helpRequestId: $hrId, reason: $reason) {
                            error { code message }
                        }
                    }
                }";
            var resignResult = await SendGraphQLAsync(resignMutation, new { hrId = helpRequestId.ToString(), reason = "Can't do it anymore" }, volunteer.Token);
            var resignError = resignResult.GetProperty("data").GetProperty("helpRequest").GetProperty("resignAsExecutor").GetProperty("error");
            if (resignError.ValueKind != JsonValueKind.Null) throw new Exception($"Resign failed: {resignError.ToString()}");
        }

        [Fact]
        public async Task Owner_CanRemoveExecutor_ShouldWork()
        {
            var creator = await RegisterAndLoginAsync("creator_rem", "creator_rem@test.com", "Password123!");
            var volunteer = await RegisterAndLoginAsync("volunteer_rem", "volunteer_rem@test.com", "Password123!");

            var helpRequestId = await CreateHelpRequestAsync(creator.Token, "Test Title", "Test Desc");
            await ApproveHelpRequestAsync(helpRequestId);

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

            var assignMutation = @"
                mutation Assign($hrId: ID!, $respId: ID!) {
                    helpRequest {
                        assignExecutor(helpRequestId: $hrId, responseId: $respId) { error { code } }
                    }
                }";
            await SendGraphQLAsync(assignMutation, new { hrId = helpRequestId.ToString(), respId = responseId }, creator.Token);

            // Remove
            var removeMutation = @"
                mutation Remove($hrId: ID!, $reason: String!) {
                    helpRequest {
                        removeExecutor(helpRequestId: $hrId, reason: $reason) {
                            error { code message }
                        }
                    }
                }";
            var removeResult = await SendGraphQLAsync(removeMutation, new { hrId = helpRequestId.ToString(), reason = "No longer needed" }, creator.Token);
            var removeError = removeResult.GetProperty("data").GetProperty("helpRequest").GetProperty("removeExecutor").GetProperty("error");
            if (removeError.ValueKind != JsonValueKind.Null) throw new Exception($"Remove failed: {removeError.ToString()}");
        }
    }
}
