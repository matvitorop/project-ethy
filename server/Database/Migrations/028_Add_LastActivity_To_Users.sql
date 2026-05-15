IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = N'LastActivityAtUtc')
BEGIN
    ALTER TABLE [dbo].[Users] ADD [LastActivityAtUtc] DATETIME2 NULL;
END
GO
