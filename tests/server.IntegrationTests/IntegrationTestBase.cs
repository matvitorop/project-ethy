using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Xunit;
using System.Net.Http.Headers;
using System;
using Microsoft.Data.SqlClient;
using Dapper;

namespace server.IntegrationTests
{
    [Collection("Integration Tests")]
    public abstract class IntegrationTestBase
    {
        protected readonly HttpClient _client;
        protected readonly CustomWebApplicationFactory _factory;

        protected IntegrationTestBase(CustomWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
            {
                HandleCookies = false
            });
        }

        protected async Task<JsonElement> SendGraphQLAsync(string query, object? variables = null, string? authToken = null)
        {
            var requestBody = new
            {
                query,
                variables
            };

            var request = new HttpRequestMessage(HttpMethod.Post, "/graphql")
            {
                Content = JsonContent.Create(requestBody)
            };

            if (!string.IsNullOrEmpty(authToken))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", authToken);
            }

            var response = await _client.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new HttpRequestException($"GraphQL Request failed: {(int)response.StatusCode}. Content: {content}");
            }

            using var document = JsonDocument.Parse(content);

            // Check for GraphQL internal errors
            if (document.RootElement.TryGetProperty("errors", out var errors))
            {
                throw new Exception($"GraphQL Error: {errors.ToString()}");
            }

            return document.RootElement.Clone();
        }

        protected async Task<(string Token, Guid UserId)> RegisterAndLoginAsync(string username, string email, string password)
        {
            var registerMutation = @"
                mutation Register($username: String!, $email: String!, $password: String!) {
                    auth {
                        register(username: $username, email: $email, password: $password) {
                            token
                            error { code message }
                        }
                    }
                }";

            var registerResult = await SendGraphQLAsync(registerMutation, new { username, email, password });
            var regData = registerResult.GetProperty("data").GetProperty("auth").GetProperty("register");

            if (regData.TryGetProperty("error", out var error) && error.ValueKind != JsonValueKind.Null)
            {
                throw new Exception($"Registration failed: {error.ToString()}");
            }

            // Hack for Integration Tests: verify the email directly in DB to allow login
            var connString = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
            if (!string.IsNullOrEmpty(connString))
            {
                await using var conn = new SqlConnection(connString);
                await conn.ExecuteAsync("UPDATE Users SET IsEmailVerified = 1 WHERE Email = @Email", new { Email = email });
            }

            var loginMutation = @"
                mutation Login($email: String!, $password: String!) {
                    auth {
                        login(email: $email, password: $password) {
                            token
                            error { code message }
                        }
                    }
                }";

            var loginResult = await SendGraphQLAsync(loginMutation, new { email, password });
            var loginData = loginResult.GetProperty("data").GetProperty("auth").GetProperty("login");

            if (loginData.TryGetProperty("error", out var loginError) && loginError.ValueKind != JsonValueKind.Null)
            {
                throw new Exception($"Login failed: {loginError.ToString()}");
            }

            var token = loginData.GetProperty("token").GetString()!;

            // Get userId via UserQuery (e.g., current profile)
            var meQuery = @"
                query {
                    userQuery {
                        profile {
                            profile {
                                id
                            }
                        }
                    }
                }";

            var meResult = await SendGraphQLAsync(meQuery, null, token);
            var profileId = meResult.GetProperty("data").GetProperty("userQuery").GetProperty("profile").GetProperty("profile").GetProperty("id").GetString()!;

            return (token, Guid.Parse(profileId));
        }

        protected async Task<Guid> CreateHelpRequestAsync(string token, string title, string description)
        {
            var mutation = @"
                mutation CreateHR($title: String!, $description: String!) {
                    helpRequest {
                        createHelpRequest(title: $title, description: $description, latitude: 0.0, longitude: 0.0, imageUrls: []) {
                            data { id }
                            error { code message }
                        }
                    }
                }";

            var result = await SendGraphQLAsync(mutation, new { title, description }, token);
            var hrData = result.GetProperty("data").GetProperty("helpRequest").GetProperty("createHelpRequest");

            if (hrData.TryGetProperty("error", out var error) && error.ValueKind != JsonValueKind.Null)
            {
                throw new Exception($"CreateHelpRequest failed: {error.ToString()}");
            }

            return Guid.Parse(hrData.GetProperty("data").GetProperty("id").GetString()!);
        }
    }
}
