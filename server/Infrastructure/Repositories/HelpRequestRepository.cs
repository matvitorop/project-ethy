using Dapper;
using Microsoft.Data.SqlClient;
using server.Application.Handlers.GetActiveRequests;
using server.Application.Handlers.GetFullHelpRequest;
using server.Application.Handlers.GetHelpRequestResponses;
using server.Application.IRepositories;
using server.Application.IServices;
using server.Domain.Chat;
using server.Domain.HelpRequest;
using System.Data;

namespace server.Infrastructure.Repositories
{
    public class HelpRequestRepository : BaseRepository, IHelpRequestRepository
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
                    AssignedUserId, LastAssignedUserId,
                    Latitude, Longitude, 
                    CreatedAtUtc, UpdatedAtUtc, 
                    IsDeleted, CancellationReason
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
                row.LastAssignedUserId,
                row.Latitude, row.Longitude, 
                row.CreatedAtUtc, row.UpdatedAtUtc,
                row.IsDeleted, row.CancellationReason,
                responses);
        }

        public async Task<IReadOnlyList<HelpRequestListItemDto>> GetPageAsync(CancellationToken ct, int page, int pageSize = 10, HelpRequestStatus? status = null, IReadOnlyList<HelpRequestStatus>? statuses = null, Guid? creatorId = null, Guid? assignedUserId = null)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            
            var offset = (page - 1) * pageSize;

            var filters = new List<string> { "hr.IsDeleted = 0" };

            if (status.HasValue)
                filters.Add("hr.Status = @Status");
            else if (statuses != null && statuses.Count > 0)
                filters.Add("hr.Status IN @Statuses");

            if (creatorId.HasValue)
                filters.Add("hr.CreatorId = @CreatorId");

            if (assignedUserId.HasValue)
                filters.Add("hr.AssignedUserId = @AssignedUserId");

            var whereClause = "WHERE " + string.Join(" AND ", filters);

            var sql = $"""
                SELECT hr.Id, hr.Title, hr.Status,
                       img.ImageUrl AS PreviewImageUrl,
                       hr.CreatedAtUtc AS CreatedAt
                FROM HelpRequests hr
                OUTER APPLY (
                    SELECT TOP 1 ImageUrl
                    FROM HelpRequestImages
                    WHERE HelpRequestId = hr.Id
                    ORDER BY [Order] ASC
                ) img
                {whereClause}
                ORDER BY hr.CreatedAtUtc DESC
                OFFSET @Offset ROWS
                FETCH NEXT @PageSize ROWS ONLY;
                """;

            var result = await connection.QueryAsync<HelpRequestListItemDto>(
                new CommandDefinition(
                    sql,
                    new
                    {
                        Offset = offset,
                        PageSize = pageSize,
                        Status = status.HasValue ? (int?)((int)status.Value) : null,
                        Statuses = statuses?.Select(s => (int)s).ToArray(),
                        CreatorId = creatorId,
                        AssignedUserId = assignedUserId
                    },
                    cancellationToken: ct));

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

        public async Task UpdateStatusAsync(
            CancellationToken ct,
            Guid id,
            HelpRequestStatus status,
            HelpRequestEvent logEvent)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            using var tx = connection.BeginTransaction();

            try
            {
                const string sql = """
            UPDATE HelpRequests
            SET Status = @Status
            WHERE Id = @Id AND IsDeleted = 0;
            """;

                var affectedRows = await connection.ExecuteAsync(
                    new CommandDefinition(
                        sql,
                        new { Id = id, Status = (int)status },
                        transaction: tx,
                        cancellationToken: ct));

                if (affectedRows == 0)
                    throw new InvalidOperationException(
                        $"HelpRequest with id '{id}' not found.");

                await InsertEventAsync(connection, tx, logEvent, ct);

                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public async Task UpdateAsync(HelpRequest request,
            HelpRequestEvent logEvent,
            CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            using var tx = connection.BeginTransaction();

            try
            {
                await UpdateHelpRequestCoreAsync(connection, tx, request, ct);
                
                await InsertEventAsync(connection, tx, logEvent, ct);
                
                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public async Task AssignExecutorAsync(HelpRequest request, Chat chat, HelpRequestStage firstStage, HelpRequestEvent logEvent, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            using var tx = connection.BeginTransaction();

            try
            {
                await UpdateHelpRequestCoreAsync(connection, tx, request, ct);

                const string insertChat = """
                    INSERT INTO Chats (Id, HelpRequestId, OwnerId, AssigneeId, CreatedAtUtc)
                    VALUES (@Id, @HelpRequestId, @OwnerId, @AssigneeId, @CreatedAtUtc);
                    """;

                await connection.ExecuteAsync(new CommandDefinition(insertChat, chat, transaction: tx, cancellationToken: ct));

                const string insertStage = """
                    INSERT INTO HelpRequestStages
                        (Id, HelpRequestId, ChatId, ProposedByUserId,
                         Content, Status, RejectionReason, CreatedAtUtc, ResolvedAtUtc)
                    VALUES
                        (@Id, @HelpRequestId, @ChatId, @ProposedByUserId,
                         @Content, @Status, @RejectionReason, @CreatedAtUtc, @ResolvedAtUtc);
                    """;

                await connection.ExecuteAsync(new CommandDefinition(
                    insertStage,
                    new
                    {
                        firstStage.Id,
                        firstStage.HelpRequestId,
                        firstStage.ChatId,
                        firstStage.ProposedByUserId,
                        firstStage.Content,
                        Status = (int)firstStage.Status,
                        firstStage.RejectionReason,
                        firstStage.CreatedAtUtc,
                        firstStage.ResolvedAtUtc
                    },
                    transaction: tx, cancellationToken: ct));

                await InsertEventAsync(connection, tx, logEvent, ct);

                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
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
            public Guid? LastAssignedUserId { get; init; }
            public double? Latitude { get; init; }
            public double? Longitude { get; init; }
            public DateTime CreatedAtUtc { get; init; }
            public DateTime? UpdatedAtUtc { get; init; }
            public bool IsDeleted { get; init; }
            public string? CancellationReason { get; init; }
        }

        public async Task<Guid?> GetCreatorIdAsync(CancellationToken ct, Guid helpRequestId)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT CreatorId FROM HelpRequests
                WHERE Id = @Id;
                """;

            return await connection.QuerySingleOrDefaultAsync<Guid?>(
                new CommandDefinition(sql, new { Id = helpRequestId }, cancellationToken: ct));
        }

        public async Task<IReadOnlyList<HelpRequestResponseDto>> GetResponsesByHelpRequestIdAsync(
            CancellationToken ct, Guid helpRequestId)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT 
                    hrr.Id,
                    hrr.UserId,
                    u.Username,
                    hrr.Message,
                    hrr.Status,
                    hrr.CreatedAtUtc
                FROM HelpRequestResponses hrr
                INNER JOIN Users u ON u.Id = hrr.UserId
                WHERE hrr.HelpRequestId = @HelpRequestId
                ORDER BY hrr.CreatedAtUtc ASC;
                """;

            var result = await connection.QueryAsync<HelpRequestResponseDto>(
                new CommandDefinition(sql,
                    new { HelpRequestId = helpRequestId },
                    cancellationToken: ct));

            return result.AsList();
        }

        private async Task UpdateHelpRequestCoreAsync(
            IDbConnection connection,
            IDbTransaction tx,
            HelpRequest request,
            CancellationToken ct)
        {
            const string updateRequest = """
                 UPDATE HelpRequests
                 SET Status = @Status, AssignedUserId = @AssignedUserId, LastAssignedUserId = @LastAssignedUserId
                 WHERE Id = @Id;
                 """;

            await connection.ExecuteAsync(new CommandDefinition(
                updateRequest,
                new { request.Id, Status = (int)request.Status, request.AssignedUserId, request.LastAssignedUserId },
                transaction: tx, cancellationToken: ct));

            const string updateResponse = """
                UPDATE HelpRequestResponses
                SET Status = @Status
                WHERE Id = @Id;
                """;

            foreach (var response in request.Responses)
            {
                await connection.ExecuteAsync(new CommandDefinition(
                    updateResponse,
                    new { response.Id, Status = (int)response.Status },
                    transaction: tx, cancellationToken: ct));
            }
        }

        public async Task EditAsync(
            HelpRequest request,
            HelpRequestEvent logEvent,
            CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            using var tx = connection.BeginTransaction();

            try
            {
                const string sql = """
                UPDATE HelpRequests
                SET Title        = @Title,
                    Description  = @Description,
                    Latitude     = @Latitude,
                    Longitude    = @Longitude,
                    UpdatedAtUtc = @UpdatedAtUtc
                WHERE Id = @Id;
                """;

                var affectedRows = await connection.ExecuteAsync(
                    new CommandDefinition(
                        sql,
                        new
                        {
                            request.Id,
                            request.Title,
                            request.Description,
                            Latitude = request.Location?.Latitude,
                            Longitude = request.Location?.Longitude,
                            request.UpdatedAtUtc
                        },
                        transaction: tx,
                        cancellationToken: ct));

                if (affectedRows == 0)
                    throw new InvalidOperationException(
                        $"HelpRequest with id '{request.Id}' not found.");

                await InsertEventAsync(connection, tx, logEvent, ct);

                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public async Task SoftDeleteAsync(Guid id, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                UPDATE HelpRequests
                SET IsDeleted = 1
                WHERE Id = @Id;
                """;

            var affectedRows = await connection.ExecuteAsync(
                new CommandDefinition(sql, new { Id = id }, cancellationToken: ct));

            if (affectedRows == 0)
                throw new InvalidOperationException(
                    $"HelpRequest with id '{id}' not found.");
        }

        public async Task CancelAsync(
            HelpRequest request,
            HelpRequestEvent logEvent,
            CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            using var tx = connection.BeginTransaction();

            try
            {
                const string updateRequest = """
                    UPDATE HelpRequests
                    SET Status             = @Status,
                        CancellationReason = @CancellationReason
                    WHERE Id = @Id;
                    """;

                await connection.ExecuteAsync(new CommandDefinition(
                    updateRequest,
                    new
                    {
                        request.Id,
                        Status = (int)request.Status,
                        request.CancellationReason
                    },
                    transaction: tx,
                    cancellationToken: ct));

                const string updateResponse = """
                    UPDATE HelpRequestResponses
                    SET Status = @Status
                    WHERE Id = @Id;
                    """;

                foreach (var response in request.Responses)
                {
                    await connection.ExecuteAsync(new CommandDefinition(
                        updateResponse,
                        new { response.Id, Status = (int)response.Status },
                        transaction: tx,
                        cancellationToken: ct));
                }

                await InsertEventAsync(connection, tx, logEvent, ct);

                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public async Task RestoreAsync(
            HelpRequest request,
            HelpRequestEvent logEvent,
            CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            using var tx = connection.BeginTransaction();

            try
            {
                const string sql = """
                    UPDATE HelpRequests
                    SET Status             = @Status,
                        CancellationReason = NULL,
                        AssignedUserId     = NULL
                    WHERE Id = @Id;
                    """;

                var affectedRows = await connection.ExecuteAsync(
                    new CommandDefinition(
                        sql,
                        new
                        {
                            request.Id,
                            Status = (int)request.Status
                        },
                        transaction: tx,
                        cancellationToken: ct));

                if (affectedRows == 0)
                    throw new InvalidOperationException(
                        $"HelpRequest with id '{request.Id}' not found.");

                await InsertEventAsync(connection, tx, logEvent, ct);

                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public async Task<bool> HasActiveRequestsAsOwnerAsync(
            Guid userId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT COUNT(1) FROM HelpRequests
                WHERE CreatorId = @UserId
                  AND Status IN (1, 2)   -- 1 = Open, 2 = InProgress
                  AND IsDeleted = 0;
                """;

            var count = await connection.ExecuteScalarAsync<int>(
                new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct));

            return count > 0;
        }

        public async Task<bool> HasActiveRequestsAsAssigneeAsync(
            Guid userId, CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                SELECT COUNT(1) FROM HelpRequests
                WHERE AssignedUserId = @UserId
                  AND Status = 2       -- 2 = InProgress
                  AND IsDeleted = 0;
                """;

            var count = await connection.ExecuteScalarAsync<int>(
                new CommandDefinition(sql, new { UserId = userId }, cancellationToken: ct));

            return count > 0;
        }

        public async Task CancelResponseAsync(
            Guid helpRequestId,
            Guid userId,
            CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);

            const string sql = """
                UPDATE HelpRequestResponses
                SET Status = @Status
                WHERE HelpRequestId = @HelpRequestId
                  AND UserId = @UserId
                  AND Status = 0;
                """;

            var affectedRows = await connection.ExecuteAsync(
                new CommandDefinition(
                    sql,
                    new
                    {
                        Status = (int)HelpRequestResponseStatus.Cancelled,
                        HelpRequestId = helpRequestId,
                        UserId = userId
                    },
                    cancellationToken: ct));

            if (affectedRows == 0)
                throw new InvalidOperationException(
                    $"Pending response for user '{userId}' not found.");
        }

        public async Task ResignAsExecutorAsync(
            HelpRequest request,
            Chat chat,
            HelpRequestEvent logEvent,
            CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            using var tx = connection.BeginTransaction();

            try
            {
                const string updateRequest = """
                    UPDATE HelpRequests
                    SET Status         = @Status,
                        AssignedUserId = NULL
                    WHERE Id = @Id;
                    """;

                await connection.ExecuteAsync(new CommandDefinition(
                    updateRequest,
                    new { request.Id, Status = (int)request.Status },
                    transaction: tx,
                    cancellationToken: ct));

                const string deactivateChat = """
                    UPDATE Chats
                    SET IsActive = 0
                    WHERE Id = @Id;
                    """;

                await connection.ExecuteAsync(new CommandDefinition(
                    deactivateChat,
                    new { chat.Id },
                    transaction: tx,
                    cancellationToken: ct));

                await InsertEventAsync(connection, tx, logEvent, ct);

                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }

        public async Task RemoveExecutorAsync(
            HelpRequest request,
            Chat chat,
            HelpRequestEvent logEvent,
            CancellationToken ct)
        {
            using var connection = await _connectionFactory.CreateOpenConnectionAsync(ct);
            using var tx = connection.BeginTransaction();

            try
            {
                const string updateRequest = """
                    UPDATE HelpRequests
                    SET Status         = @Status,
                        AssignedUserId = NULL
                    WHERE Id = @Id;
                    """;

                await connection.ExecuteAsync(new CommandDefinition(
                    updateRequest,
                    new { request.Id, Status = (int)request.Status },
                    transaction: tx,
                    cancellationToken: ct));

                const string deactivateChat = """
                    UPDATE Chats
                    SET IsActive = 0
                    WHERE Id = @Id;
                    """;

                await connection.ExecuteAsync(new CommandDefinition(
                    deactivateChat,
                    new { chat.Id },
                    transaction: tx,
                    cancellationToken: ct));

                await InsertEventAsync(connection, tx, logEvent, ct);

                tx.Commit();
            }
            catch
            {
                tx.Rollback();
                throw;
            }
        }


    }
}
