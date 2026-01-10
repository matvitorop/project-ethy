using Microsoft.Data.SqlClient;
using server.Application.IServices;
using System.Data;

namespace server.Infrastructure
{
    public class SqlConnectionFactory : ISqlConnectionFactory
    {
        private readonly string _connectionString;
        public SqlConnectionFactory(string connectionString)
        {
            _connectionString = connectionString;
        }
        public async Task<IDbConnection> CreateOpenConnectionAsync(CancellationToken ct = default)
        {
            var connection = new SqlConnection(_connectionString);

            await connection.OpenAsync(ct);

            return connection;
        }
    }
}
