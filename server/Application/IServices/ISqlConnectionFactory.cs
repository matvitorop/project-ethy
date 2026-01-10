using System.Data;

namespace server.Application.IServices
{
    public interface ISqlConnectionFactory
    {
        Task<IDbConnection> CreateOpenConnectionAsync(CancellationToken ct = default);
    }
}
