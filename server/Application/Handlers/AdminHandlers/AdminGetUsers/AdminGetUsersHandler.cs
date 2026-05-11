using MediatR;
using server.Application.IRepositories;
using server.Domain.Primitives;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace server.Application.Handlers.AdminHandlers.AdminGetUsers
{
    public class AdminGetUsersHandler
    : IRequestHandler<AdminGetUsersQuery, Result<IReadOnlyList<AdminUserDto>>>
    {
        private readonly IUserRepository _repo;

        public AdminGetUsersHandler(IUserRepository repo)
        {
            _repo = repo;
        }

        public async Task<Result<IReadOnlyList<AdminUserDto>>> Handle(AdminGetUsersQuery request, CancellationToken ct)
        {
            var items = await _repo.GetUsersPageAsync(
                request.Page,
                request.PageSize,
                request.SearchTerm,
                request.ShortId,
                ct
            );

            return Result<IReadOnlyList<AdminUserDto>>.Success(items);
        }
    }
}
