using FluentAssertions;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace server.IntegrationTests
{
    public class HelpRequestLifecycleTests : IntegrationTestBase
    {
        public HelpRequestLifecycleTests(CustomWebApplicationFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task HappyPath_Create_Respond_Assign_Complete_Report_Delete_ShouldWork()
        {
            // 1. Register User A (Creator)
            var creator = await RegisterAndLoginAsync("creator_a", "creator_a@test.com", "Password123!");
            
            // 2. Register User B (Volunteer)
            var volunteer = await RegisterAndLoginAsync("volunteer_b", "volunteer_b@test.com", "Password123!");

            // 3. Creator creates HelpRequest
            var helpRequestId = await CreateHelpRequestAsync(creator.Token, "Test Help Request", "Need help with something.");
            await ApproveHelpRequestAsync(helpRequestId);

            // 4. Volunteer responds to HelpRequest
            var respondMutation = @"
                mutation Respond($id: ID!, $message: String!) {
                    helpRequest {
                        respondToHelpRequest(helpRequestId: $id, message: $message) {
                            error { code message }
                        }
                    }
                }";
            var respondResult = await SendGraphQLAsync(respondMutation, new { id = helpRequestId.ToString(), message = "I can help!" }, volunteer.Token);
            var respondError = respondResult.GetProperty("data").GetProperty("helpRequest").GetProperty("respondToHelpRequest").GetProperty("error");
            if (respondError.ValueKind != JsonValueKind.Null) throw new Exception($"Respond failed: {respondError.ToString()}");

            // 5. Creator gets candidates and sees Volunteer
            var candidatesQuery = @"
                query GetCandidates($id: ID!) {
                    helpRequestQuer {
                        helpRequestResponses(helpRequestId: $id) {
                            items {
                                id
                                userId
                                message
                            }
                            error { code message }
                        }
                    }
                }";
            var candidatesResult = await SendGraphQLAsync(candidatesQuery, new { id = helpRequestId.ToString() }, creator.Token);
            var items = candidatesResult.GetProperty("data").GetProperty("helpRequestQuer").GetProperty("helpRequestResponses").GetProperty("items");
            items.GetArrayLength().Should().Be(1);
            var responseId = items[0].GetProperty("id").GetString()!;

            // 6. Creator assigns Volunteer
            var assignMutation = @"
                mutation Assign($hrId: ID!, $respId: ID!) {
                    helpRequest {
                        assignExecutor(helpRequestId: $hrId, responseId: $respId) {
                            error { code message }
                        }
                    }
                }";
            var assignResult = await SendGraphQLAsync(assignMutation, new { hrId = helpRequestId.ToString(), respId = responseId }, creator.Token);
            var assignError = assignResult.GetProperty("data").GetProperty("helpRequest").GetProperty("assignExecutor").GetProperty("error");
            if (assignError.ValueKind != JsonValueKind.Null) throw new Exception($"Assign failed: {assignError.ToString()}");

            // 7. Creator changes status to Completed
            var changeStatusMutation = @"
                mutation ChangeStatus($id: ID!, $status: HelpRequestStatus!) {
                    helpRequest {
                        changeHelpRequestStatus(helpRequestId: $id, status: $status) {
                            error { code message }
                        }
                    }
                }";
            var changeStatusResult = await SendGraphQLAsync(changeStatusMutation, new { id = helpRequestId.ToString(), status = "RESOLVED" }, creator.Token);
            var changeStatusError = changeStatusResult.GetProperty("data").GetProperty("helpRequest").GetProperty("changeHelpRequestStatus").GetProperty("error");
            if (changeStatusError.ValueKind != JsonValueKind.Null) throw new Exception($"Change status failed: {changeStatusError.ToString()}");

            // 8. Creator creates a report
            var reportMutation = @"
                mutation CreateReport($id: ID!, $comment: String!) {
                    helpRequest {
                        createReport(helpRequestId: $id, comment: $comment) {
                            error { code message }
                        }
                    }
                }";
            var reportResult = await SendGraphQLAsync(reportMutation, new { id = helpRequestId.ToString(), comment = "Great help!" }, creator.Token);
            var reportError = reportResult.GetProperty("data").GetProperty("helpRequest").GetProperty("createReport").GetProperty("error");
            if (reportError.ValueKind != JsonValueKind.Null) throw new Exception($"Create report failed: {reportError.ToString()}");
        }

        [Fact]
        public async Task OpenRequest_Edit_Cancel_Restore_SoftDelete_ShouldWork()
        {
            var creator = await RegisterAndLoginAsync("creator_edit", "creator_edit@test.com", "Password123!");
            var helpRequestId = await CreateHelpRequestAsync(creator.Token, "Initial Title", "Initial Description");
            await ApproveHelpRequestAsync(helpRequestId);

            // Edit
            var editMutation = @"
                mutation Edit($id: ID!, $title: String!, $desc: String!) {
                    helpRequest {
                        editHelpRequest(helpRequestId: $id, title: $title, description: $desc, latitude: 0, longitude: 0) {
                            error { code message }
                        }
                    }
                }";
            var editResult = await SendGraphQLAsync(editMutation, new { id = helpRequestId.ToString(), title = "New Title", desc = "New Desc" }, creator.Token);
            editResult.GetProperty("data").GetProperty("helpRequest").GetProperty("editHelpRequest").GetProperty("error").ValueKind.Should().Be(JsonValueKind.Null);
            await ApproveHelpRequestAsync(helpRequestId);

            // Cancel
            var cancelMutation = @"
                mutation Cancel($id: ID!, $reason: String!) {
                    helpRequest {
                        cancelHelpRequest(helpRequestId: $id, reason: $reason) {
                            error { code message }
                        }
                    }
                }";
            var cancelResult = await SendGraphQLAsync(cancelMutation, new { id = helpRequestId.ToString(), reason = "No longer needed" }, creator.Token);
            cancelResult.GetProperty("data").GetProperty("helpRequest").GetProperty("cancelHelpRequest").GetProperty("error").ValueKind.Should().Be(JsonValueKind.Null);

            // Restore
            var restoreMutation = @"
                mutation Restore($id: ID!) {
                    helpRequest {
                        restoreHelpRequest(helpRequestId: $id) {
                            error { code message }
                        }
                    }
                }";
            var restoreResult = await SendGraphQLAsync(restoreMutation, new { id = helpRequestId.ToString() }, creator.Token);
            restoreResult.GetProperty("data").GetProperty("helpRequest").GetProperty("restoreHelpRequest").GetProperty("error").ValueKind.Should().Be(JsonValueKind.Null);

            // Soft Delete
            var deleteMutation = @"
                mutation Delete($id: ID!) {
                    helpRequest {
                        softDeleteHelpRequest(helpRequestId: $id) {
                            error { code message }
                        }
                    }
                }";
            var deleteResult = await SendGraphQLAsync(deleteMutation, new { id = helpRequestId.ToString() }, creator.Token);
            deleteResult.GetProperty("data").GetProperty("helpRequest").GetProperty("softDeleteHelpRequest").GetProperty("error").ValueKind.Should().Be(JsonValueKind.Null);
        }
    }
}
