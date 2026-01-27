using Dapper;
using Microsoft.Data.SqlClient;
using server.Application.Handlers.GetActiveRequests;
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

        public async Task<IReadOnlyList<HelpRequestListItemDto>> GetPageAsync(int page, int pageSize, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            var offset = (page - 1) * pageSize;

            var sql = """
           SELECT
               hr.Id,
               hr.Title,
               hr.Category,
               hr.Status,
               img.Url AS PreviewImageUrl,
               hr.CreatedAt
           FROM HelpRequests hr
           OUTER APPLY (
               SELECT TOP 1 Url
               FROM HelpRequestImages
               WHERE HelpRequestId = hr.Id
               ORDER BY SortOrder
           ) img
           ORDER BY hr.CreatedAt DESC
           OFFSET @Offset ROWS
           FETCH NEXT @PageSize ROWS ONLY;
           """;

            var result = await connection.QueryAsync<HelpRequestListItemDto>(
                sql,
                new { Offset = offset, PageSize = pageSize });

            return result.AsList();
        }
    }
}
