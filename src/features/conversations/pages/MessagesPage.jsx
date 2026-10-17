import { useId } from 'react';
import { Outlet, useMatch, useSearchParams } from 'react-router';
import clsx from 'clsx';
import { AccountShell } from '../../../components/layout/AccountShell.jsx';
import { PageTopBar } from '../../../components/layout/PageTopBar.jsx';
import { IconNavChats } from '../../../components/icons/index.js';
import { EmptyState } from '../../../components/ui/EmptyState.jsx';
import { ErrorState } from '../../../components/ui/ErrorState.jsx';
import { Pagination } from '../../../components/ui/Pagination.jsx';
import { RetryBanner } from '../../../components/ui/RetryBanner.jsx';
import { Skeleton } from '../../../components/ui/Skeleton.jsx';
import { toProblem } from '../../../lib/http/problemDetails.js';
import { ar } from '../../../locales/ar.js';
import { ConversationListItem } from '../components/ConversationListItem.jsx';
import { useGetConversationQuery, useGetConversationsQuery } from '../conversationsApi.js';

const text = ar.conversations;
const PAGE_SIZE = 20;

/** `?page=` as a whole number from 1. */
function readPage(searchParams) {
  const page = Math.floor(Number(searchParams.get('page')));
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

/**
 * `/messages` — Figma "المحادثات — مستخدم" (76:968): the account sidebar and one panel with the
 * conversations list (330, bg/surface) at the start and the open chat (the child route) beside
 * it. Below 1280px the list and the chat are separate pages (84:530). 20 conversations per page.
 */
export default function MessagesPage() {
  const chatMatch = useMatch('/messages/:conversationId');
  const openId = chatMatch?.params.conversationId ?? null;
  const [searchParams, setSearchParams] = useSearchParams();
  const page = readPage(searchParams);
  let pageSearch = '';
  if (page > 1) pageSearch = `?page=${page}`;
  const { data, isLoading, error, refetch } = useGetConversationsQuery(
    { page, pageSize: PAGE_SIZE },
    { refetchOnFocus: true },
  );
  const openConversation = useGetConversationQuery(openId, { skip: !openId });
  const titleId = useId();

  function changePage(nextPage) {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set('page', String(nextPage));
    setSearchParams(params);
  }

  let list;
  if (isLoading) {
    list = (
      <div className="flex flex-col gap-px">
        <Skeleton className="h-[86px] rounded-none" />
        <Skeleton className="h-[86px] rounded-none" />
        <Skeleton className="h-[86px] rounded-none" />
      </div>
    );
  } else if (error && !data) {
    const problem = toProblem(error);
    let requestId;
    if (problem.status >= 500) requestId = problem.requestId;
    list = (
      <div className="p-4">
        <ErrorState message={problem.message} requestId={requestId} onRetry={refetch} />
      </div>
    );
  } else if (data.items.length === 0 && page > 1) {
    list = (
      <div className="p-4">
        <EmptyState
          title={text.emptyTitle}
          action={{ label: text.previousPage, onClick: () => changePage(page - 1) }}
        />
      </div>
    );
  } else if (data.items.length === 0) {
    list = (
      <div className="p-4">
        <EmptyState
          title={text.emptyTitle}
          description={text.emptyText}
          action={{ label: text.browse, to: '/properties' }}
        />
      </div>
    );
  } else {
    list = (
      <>
        {error && <RetryBanner onRetry={refetch} />}
        <ul className="divide-y divide-border border-b border-border">
          {data.items.map((conversation) => (
            <li key={conversation.id}>
              <ConversationListItem conversation={conversation} search={pageSearch} />
            </li>
          ))}
        </ul>
        <Pagination
          page={data.pageNumber}
          totalPages={data.totalPages}
          onPageChange={changePage}
          className="px-3 py-4"
        />
      </>
    );
  }

  let topBar = <PageTopBar title={text.title} backTo="/dashboard" />;
  if (openId) {
    let name = text.title;
    if (openConversation.data?.otherParty) name = openConversation.data.otherParty.fullName;
    if (openConversation.data && !openConversation.data.otherParty) name = text.deletedUser;
    topBar = <PageTopBar title={name} backTo={`/messages${pageSearch}`} />;
  }

  return (
    <>
      {topBar}
      <AccountShell>
        <div
          className={clsx(
            'flex overflow-hidden rounded-lg border border-border bg-raised xl:h-[calc(100dvh-150px)] xl:min-h-[560px]',
            openId && 'h-[calc(100dvh-90px)]',
          )}
        >
          <section
            aria-labelledby={titleId}
            className={clsx(
              'w-full flex-col bg-surface xl:flex xl:w-[330px] xl:shrink-0 xl:border-e xl:border-border',
              openId ? 'hidden' : 'flex',
            )}
          >
            <h1
              id={titleId}
              className="hidden bg-raised px-[18px] py-[17px] text-[16px] leading-[1.72] font-bold text-text xl:block"
            >
              {text.title}
            </h1>
            <div className="min-h-0 flex-1 overflow-y-auto">{list}</div>
          </section>

          <div className={clsx('min-w-0 flex-1 flex-col', openId ? 'flex' : 'hidden xl:flex')}>
            {openId && <Outlet />}
            {!openId && (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                <span className="rounded-full bg-brand-subtle p-3 text-brand-text">
                  <IconNavChats />
                </span>
                <p className="text-[15px] leading-[1.72] font-bold text-text">{text.pickTitle}</p>
                <p className="text-[13px] leading-[1.72] text-text-secondary">{text.pickText}</p>
              </div>
            )}
          </div>
        </div>
      </AccountShell>
    </>
  );
}
