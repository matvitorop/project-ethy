using Dapper;
using server.Application.IRepositories;
using server.Domain.HelpRequest;
using System.Data;

namespace server.Infrastructure.Repositories
{
    public class HelpRequestRepository : IHelpRequestRepository
    {
        private readonly IDbConnection _connection;

        public HelpRequestRepository(IDbConnection connection)
        {
            _connection = connection;
        }

        public async Task AddAsync(HelpRequest request, CancellationToken ct)
        {
            using var tx = _connection.BeginTransaction();

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

            await _connection.ExecuteAsync(
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
                tx
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

            foreach (var image in request.Images)
            {
                await _connection.ExecuteAsync(
                    insertImage,
                    new
                    {
                        Id = Guid.NewGuid(),
                        HelpRequestId = request.Id,
                        image.Order,
                        image.ImageUrl
                    },
                    tx
                );
            }

            tx.Commit();
        }
    }
}
