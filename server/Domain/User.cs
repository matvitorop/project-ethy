namespace server.Domain
{
    public enum UserRole
    {
        Admin = 0,
        User = 1,
        Volounteer = 2
    }
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public string PasswordSalt { get; set; }
        public UserRole Role { get; private set; }

        private User() { }

        public User(string userName, string email, string passwordHash, string passwordSalt, UserRole role)
        {
            Id = Guid.NewGuid();
            Username = userName;
            Email = email;
            PasswordHash = passwordHash;
            PasswordSalt = passwordSalt;
            Role = role;
        }
    }
}
