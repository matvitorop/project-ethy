using Dapper;
using Microsoft.Data.SqlClient;
using server.Application.Handlers.GetActiveRequests;
using server.Application.Handlers.GetFullHelpRequest;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.HelpRequest;
using System.Data;

namespace server.Infrastructure.Repositories
{
    public class HelpRequestRepository : IHelpRequestRepository
    {
        private readonly ISqlConnectionFactory _connectionFactory;

        public HelpRequestRepository(ISqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task AddAsync(HelpRequest request, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            using var tx = connection.BeginTransaction();

            try{
                const string insertRequest = """
                INSERT INTO HelpRequests
                (
                    Id, CreatorId, Title, Description, Status,
                    Latitude, Longitude, CreatedAtUtc
                )
                VALUES
                (
                    @Id, @CreatorId, @Title, @Description, @Status,
                    @Latitude, @Longitude, @CreatedAtUtc
                );
                """;

                await connection.ExecuteAsync(
                    new CommandDefinition(
                        insertRequest,
                        new
                        {
                            request.Id,
                            request.CreatorId,
                            request.Title,
                            request.Description,
                            Status = (int)request.Status,
                            Latitude = request.Location?.Latitude,
                            Longitude = request.Location?.Longitude,
                            request.CreatedAtUtc
                        },
                        transaction: tx,
                        cancellationToken: ct
                    )
                );

                const string insertImage = """
                    INSERT INTO HelpRequestImages
                    (
                        Id, HelpRequestId, [Order], ImageUrl
                    )
                    VALUES
                    (
                        @Id, @HelpRequestId, @Order, @ImageUrl
                    );
                    """;

                var imageParams = request.Images.Select(img => new
                {
                    Id = Guid.NewGuid(),
                    HelpRequestId = request.Id,
                    Order = img.Order,
                    ImageUrl = img.ImageUrl
                }).ToList();

                await connection.ExecuteAsync(
                    new CommandDefinition(
                        insertImage,
                        imageParams,
                        transaction: tx,
                        cancellationToken: ct
                    )
                );

                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }
        public async Task<HelpRequest?> GetAggregateByIdAsync(CancellationToken ct, Guid id)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string requestSql = """
             SELECT Id, CreatorId, Title, Description, Status,
                    AssignedUserId, Latitude, Longitude, CreatedAtUtc
             FROM HelpRequests
             WHERE Id = @Id;
             """;

            var row = await connection.QuerySingleOrDefaultAsync<HelpRequestRow>(
                requestSql, new { Id = id });

            if (row is null) return null;

            const string responsesSql = """
                SELECT Id, UserId, Status, Message, CreatedAtUtc
                FROM HelpRequestResponses
                WHERE HelpRequestId = @Id;
                """;

            var responses = await connection.QueryAsync<HelpRequestResponse>(
                responsesSql, new { Id = id });

            return new HelpRequest(
                row.Id, row.CreatorId, row.Title, row.Description,
                row.Status, row.AssignedUserId,
                row.Latitude, row.Longitude, row.CreatedAtUtc,
                responses);
        }

        public async Task<IReadOnlyList<HelpRequestListItemDto>> GetPageAsync(CancellationToken ct, int page, int pageSize = 10)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            var offset = (page - 1) * pageSize;

            var sql = """
                SELECT 
                    hr.Id,
                    hr.Title,
                    hr.Status,
                    img.ImageUrl AS PreviewImageUrl,
                    hr.CreatedAtUtc AS CreatedAt
                FROM HelpRequests hr
                OUTER APPLY (
                    SELECT TOP 1 ImageUrl
                    FROM HelpRequestImages
                    WHERE HelpRequestId = hr.Id
                    ORDER BY [Order] ASC
                ) img
                ORDER BY hr.CreatedAtUtc DESC
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY;
                """;

            var result = await connection.QueryAsync<HelpRequestListItemDto>(
                new CommandDefinition(
                    sql,
                    new { Offset = offset, PageSize = pageSize },
                    cancellationToken: ct
                    ));

            return result.AsList();
        }

        public async Task<HelpRequestDetailDto?> GetHelpRequestById(CancellationToken ct, Guid id)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string requestSql = """
                SELECT 
                    Id,
                    CreatorId,
                    Title,
                    Description,
                    Status,
                    Latitude,
                    Longitude,
                    CreatedAtUtc
                FROM HelpRequests
                WHERE Id = @Id;
            """;

            var request = await connection
                .QuerySingleOrDefaultAsync<HelpRequestDetailDto>(
                    requestSql,
                    new { Id = id });

            if (request is null)
                return null;

            const string imagesSql = """
                SELECT ImageUrl
                FROM HelpRequestImages
                WHERE HelpRequestId = @Id
                ORDER BY [Order];
             """;

            var images = await connection
                .QueryAsync<string>(imagesSql, new { Id = id });

            return request with
            {
                ImageUrls = images.AsList()
            };
        }

        public async Task UpdateStatusAsync(CancellationToken ct, Guid id, HelpRequestStatus status)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                UPDATE HelpRequests
                SET Status = @Status
                WHERE Id = @Id;
            """;

            var affectedRows = await connection.ExecuteAsync(
                new CommandDefinition(
                    sql,
                    new
                    {
                        Id = id,
                        Status = status
                    },
                    cancellationToken: ct));

            if (affectedRows == 0)
            {
                throw new InvalidOperationException(
                    $"HelpRequest with id '{id}' not found.");
            }
        }

        public async Task UpdateAsync(HelpRequest request, CancellationToken ct)
        {
        }

        public async Task AddResponseAsync(Guid helpRequestId, HelpRequestResponse response, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                INSERT INTO HelpRequestResponses (Id, HelpRequestId, UserId, Status, Message, CreatedAtUtc)
                VALUES (@Id, @HelpRequestId, @UserId, @Status, @Message, @CreatedAtUtc);
                """;

            await connection.ExecuteAsync(
                new CommandDefinition(
                    sql,
                    new
                    {
                        response.Id,
                        HelpRequestId = helpRequestId,
                        response.UserId,
                        Status = (int)response.Status,
                        response.Message,
                        response.CreatedAtUtc
                    },
                    cancellationToken: ct));
        }

        private sealed class HelpRequestRow
        {
            public Guid Id { get; init; }
            public Guid CreatorId { get; init; }
            public string Title { get; init; } = null!;
            public string Description { get; init; } = null!;
            public int Status { get; init; }
            public Guid? AssignedUserId { get; init; }
            public double? Latitude { get; init; }
            public double? Longitude { get; init; }
            public DateTime CreatedAtUtc { get; init; }
        }
    }
}
