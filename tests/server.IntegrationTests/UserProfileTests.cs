using FluentAssertions;
using System;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;

namespace server.IntegrationTests
{
    [Collection("Integration Tests")]
    public class UserProfileTests : IntegrationTestBase
    {
        public UserProfileTests(CustomWebApplicationFactory factory) : base(factory)
        {
        }

        [Fact]
        public async Task Cannot_DeleteProfile_IfHasActiveRequestsAsOwner()
        {
            var user = await RegisterAndLoginAsync("del_owner", "del_owner@test.com", "Password123!");

            // Create an active request
            await CreateHelpRequestAsync(user.Token, "Title", "Desc");

            // Attempt to delete profile
            var deleteMutation = @"
                mutation {
                    auth {
                        deleteAccount {
                            error { code message }
                        }
                    }
                }";

            var result = await SendGraphQLAsync(deleteMutation, null, user.Token);
            var error = result.GetProperty("data").GetProperty("auth").GetProperty("deleteAccount").GetProperty("error");
            
            error.ValueKind.Should().NotBe(JsonValueKind.Null);
            error.GetProperty("code").GetString().Should().Be("User.HAS_ACTIVE_REQUESTS_AS_OWNER");
        }

        [Fact]
        public async Task Can_DeleteProfile_IfNoActiveRequests()
        {
            var user = await RegisterAndLoginAsync("del_clean", "del_clean@test.com", "Password123!");

            var deleteMutation = @"
                mutation {
                    auth {
                        deleteAccount {
                            error { code message }
                        }
                    }
                }";

            var result = await SendGraphQLAsync(deleteMutation, null, user.Token);
            var error = result.GetProperty("data").GetProperty("auth").GetProperty("deleteAccount").GetProperty("error");
            
            error.ValueKind.Should().Be(JsonValueKind.Null);
        }
    }
}
