-- Видалення застарілого поля CreatedAt, яке було замінено на RegisteredAtUtc
BEGIN TRANSACTION;

-- Видаляємо обмеження за замовчуванням (Default Constraint), перш ніж видалити колонку
DECLARE @ConstraintName nvarchar(200);
SELECT @ConstraintName = Name 
FROM sys.default_constraints 
WHERE parent_object_id = OBJECT_ID('Users') 
AND parent_column_id = (SELECT column_id FROM sys.columns WHERE name = 'CreatedAt' AND object_id = OBJECT_ID('Users'));

IF @ConstraintName IS NOT NULL
    EXEC('ALTER TABLE Users DROP CONSTRAINT ' + @ConstraintName);

-- Видаляємо саму колонку
ALTER TABLE Users
DROP COLUMN CreatedAt;

COMMIT;
