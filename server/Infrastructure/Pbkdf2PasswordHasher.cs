using server.Application.Services;
using System.Security.Cryptography;

namespace server.Infrastructure
{
    public class Pbkdf2PasswordHasher : IPasswordHasher
    {
        private const int Iterations = 100_000;
        private const int SaltSize = 16;
        private const int KeySize = 32;

        public (string hash, string salt) Hash(string password)
        {
            using var rng = RandomNumberGenerator.Create();
            var saltBytes = new byte[SaltSize];
            rng.GetBytes(saltBytes);

            using var pbkdf2 = new Rfc2898DeriveBytes(
                password,
                saltBytes,
                Iterations,
                HashAlgorithmName.SHA256
            );

            var hashBytes = pbkdf2.GetBytes(KeySize);

            return (
                Convert.ToBase64String(hashBytes),
                Convert.ToBase64String(saltBytes)
            );
        }

        public bool Verify(string password, string hash, string salt)
        {
            var saltBytes = Convert.FromBase64String(salt);

            using var pbkdf2 = new Rfc2898DeriveBytes(
                password,
                saltBytes,
                Iterations,
                HashAlgorithmName.SHA256
            );

            var computedHash = pbkdf2.GetBytes(KeySize);
            var storedHash = Convert.FromBase64String(hash);

            return CryptographicOperations.FixedTimeEquals(
                computedHash,
                storedHash
            );
        }
    }
}
