CREATE TABLE Notifications (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    UserId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(200) NOT NULL,
    Content NVARCHAR(MAX) NOT NULL,
    Type INT NOT NULL,
    IsRead BIT NOT NULL DEFAULT 0,
    CreatedAtUtc DATETIME2 NOT NULL,
    RelatedEntityId UNIQUEIDENTIFIER NULL,
    RelatedEntityType NVARCHAR(50) NULL,
    CONSTRAINT FK_Notifications_Users FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE
);

CREATE INDEX IX_Notifications_UserId_IsRead ON Notifications(UserId, IsRead);
CREATE INDEX IX_Notifications_CreatedAt ON Notifications(CreatedAtUtc DESC);
