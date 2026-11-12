export function BoardSkeleton() {
  return (
    <div className="min-h-screen flex bg-[#0e0e10] text-[#ededed]">
      {/* Sidebar Skeleton */}
      <aside className="w-64 border-r border-zinc-800/80 bg-[#121214] flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          {/* Workspace Header Skeleton */}
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
            <div className="h-6 w-6 rounded bg-zinc-800 animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-zinc-800/70 rounded animate-pulse" />
            </div>
          </div>

          {/* Views Skeleton */}
          <div className="space-y-2 px-1">
            <div className="h-2.5 w-12 bg-zinc-800/70 rounded animate-pulse" />
            <div className="h-8 w-full bg-zinc-800/60 rounded-lg animate-pulse" />
          </div>

          {/* Projects List Skeleton */}
          <div className="space-y-2 px-1">
            <div className="h-2.5 w-16 bg-zinc-800/70 rounded animate-pulse" />
            <div className="h-8 w-full bg-zinc-900 rounded-lg animate-pulse" />
            <div className="h-8 w-4/5 bg-zinc-900 rounded-lg animate-pulse" />
          </div>
        </div>

        <div className="h-8 w-full bg-zinc-900 rounded-lg animate-pulse" />
      </aside>

      {/* Main Board Skeleton */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Skeleton */}
        <header className="h-14 border-b border-zinc-800/80 px-6 flex items-center justify-between shrink-0">
          <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-24 bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-7 w-24 bg-zinc-800 rounded-lg animate-pulse" />
          </div>
        </header>

        {/* 5 Kanban Columns Skeleton */}
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-3.5 h-full min-w-max">
            {[1, 2, 3, 4, 5].map((col) => (
              <div
                key={col}
                className="w-64 flex flex-col bg-[#121214] border border-zinc-800/80 rounded-xl p-3 space-y-3"
              >
                <div className="flex items-center gap-2 px-1">
                  <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 w-5 bg-zinc-800/70 rounded animate-pulse" />
                </div>

                {/* Fake Issue Cards */}
                <div className="space-y-2.5">
                  {Array.from({ length: col === 2 ? 3 : col === 3 ? 2 : 1 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-[#18181b] border border-zinc-800/80 space-y-2.5"
                    >
                      <div className="flex justify-between">
                        <div className="h-2.5 w-10 bg-zinc-800 rounded animate-pulse" />
                        <div className="h-3.5 w-12 bg-zinc-800 rounded animate-pulse" />
                      </div>
                      <div className="h-3.5 w-full bg-zinc-800 rounded animate-pulse" />
                      <div className="h-3.5 w-3/4 bg-zinc-800/70 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}