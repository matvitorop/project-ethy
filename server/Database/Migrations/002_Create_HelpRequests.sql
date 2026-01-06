CREATE TABLE HelpRequests (
    Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY,
    CreatorId UNIQUEIDENTIFIER NOT NULL,

    Title NVARCHAR(200) NOT NULL,
    Description NVARCHAR(4000) NOT NULL,

    Status INT NOT NULL,

    Latitude FLOAT NULL,
    Longitude FLOAT NULL,

    CreatedAtUtc DATETIME2 NOT NULL,

    CONSTRAINT FK_HelpRequests_Users
        FOREIGN KEY (CreatorId) REFERENCES Users(Id)
);