"use strict";
const jsxRuntime = require("react/jsx-runtime");
const adminSdk = require("@medusajs/admin-sdk");
const components = require("@medusajs/dashboard/components");
const ui = require("@medusajs/ui");
const reactQuery = require("@tanstack/react-query");
const React = require("react");
const reactI18next = require("react-i18next");
const reactRouterDom = require("react-router-dom");
const locale = require("date-fns/locale");
const icons = require("@medusajs/icons");
const Medusa = require("@medusajs/js-sdk");
const dateFns = require("date-fns");
const zod$1 = require("@hookform/resolvers/zod");
const reactHookForm = require("react-hook-form");
const zod = require("zod");
const radixUi = require("radix-ui");
const react = require("@ariakit/react");
const matchSorter = require("match-sorter");
const debounce = require("lodash.debounce");
const Primitive = require("@uiw/react-json-view");
const isEqual = require("lodash.isequal");
const _interopDefault = (e) => e && e.__esModule ? e : { default: e };
const React__default = /* @__PURE__ */ _interopDefault(React);
const Medusa__default = /* @__PURE__ */ _interopDefault(Medusa);
const debounce__default = /* @__PURE__ */ _interopDefault(debounce);
const Primitive__default = /* @__PURE__ */ _interopDefault(Primitive);
const isEqual__default = /* @__PURE__ */ _interopDefault(isEqual);
function toLocaleTag(language) {
  if (!language) {
    return "en";
  }
  return language.replace(/^([a-z]{2,3})([A-Z]{2})$/, "$1-$2");
}
const DATE_LOCALES = {
  ptBR: locale.ptBR
};
function getDateLocale(language) {
  return language && DATE_LOCALES[language] || locale.enUS;
}
function getPluralForm(language, count) {
  try {
    const form = new Intl.PluralRules(toLocaleTag(language)).select(count);
    return form === "one" ? "one" : "other";
  } catch {
    return count === 1 ? "one" : "other";
  }
}
const usePlural = () => {
  const { t, i18n } = reactI18next.useTranslation();
  const language = i18n.language;
  return React.useCallback(
    (key, count, options) => t(key, {
      ...options,
      count,
      context: getPluralForm(language, count)
    }),
    [t, language]
  );
};
function useQueryParams(keys, prefix) {
  const [params] = reactRouterDom.useSearchParams();
  const result = {};
  keys.forEach((key) => {
    const prefixedKey = prefix ? `${prefix}_${key}` : key;
    const value = params.get(prefixedKey) || void 0;
    result[key] = value;
  });
  return result;
}
const ConditionalTooltip = ({
  children,
  showTooltip = false,
  ...props
}) => {
  if (showTooltip) {
    return /* @__PURE__ */ jsxRuntime.jsx(ui.Tooltip, { ...props, children });
  }
  return children;
};
const ActionMenu = ({
  groups,
  variant = "transparent",
  children
}) => {
  const inner = children ?? /* @__PURE__ */ jsxRuntime.jsx(ui.IconButton, { size: "small", variant, children: /* @__PURE__ */ jsxRuntime.jsx(icons.EllipsisHorizontal, {}) });
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.DropdownMenu, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.DropdownMenu.Trigger, { asChild: true, children: inner }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.DropdownMenu.Content, { children: groups.map((group, index) => {
      if (!group.actions.length) {
        return null;
      }
      const isLast = index === groups.length - 1;
      return /* @__PURE__ */ jsxRuntime.jsxs(ui.DropdownMenu.Group, { children: [
        group.actions.map((action, index2) => {
          const Wrapper = action.disabledTooltip ? ({ children: children2 }) => /* @__PURE__ */ jsxRuntime.jsx(
            ConditionalTooltip,
            {
              showTooltip: action.disabled,
              content: action.disabledTooltip,
              side: "right",
              children: /* @__PURE__ */ jsxRuntime.jsx("div", { children: children2 })
            }
          ) : "div";
          if (action.onClick) {
            return /* @__PURE__ */ jsxRuntime.jsx(Wrapper, { children: /* @__PURE__ */ jsxRuntime.jsxs(
              ui.DropdownMenu.Item,
              {
                disabled: action.disabled,
                onClick: (e) => {
                  e.stopPropagation();
                  action.onClick();
                },
                className: ui.clx(
                  "[&_svg]:text-ui-fg-subtle flex items-center gap-x-2",
                  {
                    "[&_svg]:text-ui-fg-disabled": action.disabled
                  }
                ),
                children: [
                  action.icon,
                  /* @__PURE__ */ jsxRuntime.jsx("span", { children: action.label })
                ]
              }
            ) }, index2);
          }
          return /* @__PURE__ */ jsxRuntime.jsx(Wrapper, { children: /* @__PURE__ */ jsxRuntime.jsx(
            ui.DropdownMenu.Item,
            {
              className: ui.clx(
                "[&_svg]:text-ui-fg-subtle flex items-center gap-x-2",
                {
                  "[&_svg]:text-ui-fg-disabled": action.disabled
                }
              ),
              asChild: true,
              disabled: action.disabled,
              children: /* @__PURE__ */ jsxRuntime.jsxs(reactRouterDom.Link, { to: action.to, onClick: (e) => e.stopPropagation(), children: [
                action.icon,
                /* @__PURE__ */ jsxRuntime.jsx("span", { children: action.label })
              ] })
            }
          ) }, index2);
        }),
        !isLast && /* @__PURE__ */ jsxRuntime.jsx(ui.DropdownMenu.Separator, {})
      ] }, index);
    }) })
  ] });
};
const DataTable = ({
  data = [],
  columns,
  filters,
  commands,
  action,
  actionMenu,
  getRowId,
  rowCount = 0,
  enablePagination = true,
  enableSearch = true,
  autoFocusSearch = false,
  rowHref,
  heading,
  subHeading,
  prefix,
  pageSize = 10,
  emptyState,
  rowSelection,
  isLoading = false,
  layout = "auto"
}) => {
  const { t } = reactI18next.useTranslation();
  const tp = usePlural();
  const enableFiltering = filters && filters.length > 0;
  const enableCommands = commands && commands.length > 0;
  const enableSorting = columns.some((column) => column.enableSorting);
  const filterIds = filters?.map((f) => f.id) ?? [];
  const prefixedFilterIds = filterIds.map((id) => getQueryParamKey(id, prefix));
  const { offset, order, q, ...filterParams } = useQueryParams(
    [
      ...filterIds,
      ...enableSorting ? ["order"] : [],
      ...enableSearch ? ["q"] : [],
      ...enablePagination ? ["offset"] : []
    ],
    prefix
  );
  const [_, setSearchParams] = reactRouterDom.useSearchParams();
  const [search, setSearch] = React.useState(q ?? "");
  const handleSearchChange = (value) => {
    setSearch(value);
    setSearchParams((prev) => {
      if (value) {
        prev.set(getQueryParamKey("q", prefix), value);
      } else {
        prev.delete(getQueryParamKey("q", prefix));
      }
      return prev;
    });
  };
  const [pagination, setPagination] = React.useState(
    offset ? parsePaginationState(offset, pageSize) : { pageIndex: 0, pageSize }
  );
  const handlePaginationChange = (value) => {
    setPagination(value);
    setSearchParams((prev) => {
      if (value.pageIndex === 0) {
        prev.delete(getQueryParamKey("offset", prefix));
      } else {
        prev.set(
          getQueryParamKey("offset", prefix),
          transformPaginationState(value).toString()
        );
      }
      return prev;
    });
  };
  const [filtering, setFiltering] = React.useState(
    parseFilterState(filterIds, filterParams)
  );
  const handleFilteringChange = (value) => {
    setFiltering(value);
    setSearchParams((prev) => {
      Array.from(prev.keys()).forEach((key) => {
        if (prefixedFilterIds.includes(key) && !(key in value)) {
          prev.delete(key);
        }
      });
      Object.entries(value).forEach(([key, filter]) => {
        if (prefixedFilterIds.includes(getQueryParamKey(key, prefix)) && filter) {
          prev.set(getQueryParamKey(key, prefix), JSON.stringify(filter));
        }
      });
      return prev;
    });
  };
  const [sorting, setSorting] = React.useState(
    order ? parseSortingState(order) : null
  );
  const handleSortingChange = (value) => {
    setSorting(value);
    setSearchParams((prev) => {
      if (value) {
        const valueToStore = transformSortingState(value);
        prev.set(getQueryParamKey("order", prefix), valueToStore);
      } else {
        prev.delete(getQueryParamKey("order", prefix));
      }
      return prev;
    });
  };
  const navigate = reactRouterDom.useNavigate();
  const onRowClick = React.useCallback(
    (event, row) => {
      if (!rowHref) {
        return;
      }
      const href = rowHref(row);
      if (event.metaKey || event.ctrlKey || event.button === 1) {
        window.open(href, "_blank", "noreferrer");
        return;
      }
      if (event.shiftKey) {
        window.open(href, void 0, "noreferrer");
        return;
      }
      navigate(href);
    },
    [navigate, rowHref]
  );
  const instance = ui.useDataTable({
    data,
    columns,
    filters,
    commands,
    rowCount,
    getRowId,
    onRowClick: rowHref ? onRowClick : void 0,
    pagination: enablePagination ? {
      state: pagination,
      onPaginationChange: handlePaginationChange
    } : void 0,
    filtering: enableFiltering ? {
      state: filtering,
      onFilteringChange: handleFilteringChange
    } : void 0,
    sorting: enableSorting ? {
      state: sorting,
      onSortingChange: handleSortingChange
    } : void 0,
    search: enableSearch ? {
      state: search,
      onSearchChange: handleSearchChange
    } : void 0,
    rowSelection,
    isLoading
  });
  const shouldRenderHeading = heading || subHeading;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    ui.DataTable,
    {
      instance,
      className: ui.clx({
        "h-full [&_tr]:last-of-type:!border-b": layout === "fill"
      }),
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          ui.DataTable.Toolbar,
          {
            className: "flex flex-col items-start justify-between gap-2 md:flex-row md:items-center",
            translations: { clearAll: t("draftOrdersPlugin.table.clearAll") },
            children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full items-center justify-between gap-2", children: [
                shouldRenderHeading && /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                  heading && /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: heading }),
                  subHeading && /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: subHeading })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-x-2 md:hidden", children: [
                  enableFiltering && /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.FilterMenu, { tooltip: t("draftOrdersPlugin.table.filter") }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.SortingMenu, { tooltip: t("draftOrdersPlugin.table.sort") }),
                  actionMenu && /* @__PURE__ */ jsxRuntime.jsx(ActionMenu, { variant: "primary", ...actionMenu }),
                  action && /* @__PURE__ */ jsxRuntime.jsx(DataTableAction, { ...action })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full items-center gap-2 md:justify-end", children: [
                enableSearch && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full md:w-auto", children: /* @__PURE__ */ jsxRuntime.jsx(
                  ui.DataTable.Search,
                  {
                    "data-modal-id": "modal-search-input",
                    placeholder: t("draftOrdersPlugin.table.search"),
                    autoFocus: autoFocusSearch
                  }
                ) }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "hidden items-center gap-x-2 md:flex", children: [
                  enableFiltering && /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.FilterMenu, { tooltip: t("draftOrdersPlugin.table.filter") }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.SortingMenu, { tooltip: t("draftOrdersPlugin.table.sort") }),
                  actionMenu && /* @__PURE__ */ jsxRuntime.jsx(ActionMenu, { variant: "primary", ...actionMenu }),
                  action && /* @__PURE__ */ jsxRuntime.jsx(DataTableAction, { ...action })
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(ui.DataTable.Table, { emptyState }),
        enablePagination && /* @__PURE__ */ jsxRuntime.jsx(
          ui.DataTable.Pagination,
          {
            translations: {
              of: t("draftOrdersPlugin.table.pagination.of"),
              results: t("draftOrdersPlugin.table.pagination.results"),
              pages: t("draftOrdersPlugin.table.pagination.pages"),
              prev: t("draftOrdersPlugin.table.pagination.prev"),
              next: t("draftOrdersPlugin.table.pagination.next")
            }
          }
        ),
        enableCommands && /* @__PURE__ */ jsxRuntime.jsx(
          ui.DataTable.CommandBar,
          {
            selectedLabel: (count) => tp("draftOrdersPlugin.table.selected", count)
          }
        )
      ]
    }
  );
};
function transformSortingState(value) {
  return value.desc ? `-${value.id}` : value.id;
}
function parseSortingState(value) {
  return value.startsWith("-") ? { id: value.slice(1), desc: true } : { id: value, desc: false };
}
function transformPaginationState(value) {
  return value.pageIndex * value.pageSize;
}
function parsePaginationState(value, pageSize) {
  const offset = parseInt(value);
  return {
    pageIndex: Math.floor(offset / pageSize),
    pageSize
  };
}
function parseFilterState(filterIds, value) {
  if (!value) {
    return {};
  }
  const filters = {};
  for (const id of filterIds) {
    const filterValue = value[id];
    if (filterValue) {
      filters[id] = JSON.parse(filterValue);
    }
  }
  return filters;
}
function getQueryParamKey(key, prefix) {
  return prefix ? `${prefix}_${key}` : key;
}
const DataTableAction = ({
  label,
  disabled,
  ...props
}) => {
  const buttonProps = {
    size: "small",
    disabled: disabled ?? false,
    type: "button",
    variant: "secondary"
  };
  if ("to" in props) {
    return /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { ...buttonProps, asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Link, { to: props.to, children: label }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { ...buttonProps, onClick: props.onClick, children: label });
};
const backendUrl = __BACKEND_URL__ ?? "/";
const authType = __AUTH_TYPE__ ?? "session";
const jwtTokenStorageKey = __JWT_TOKEN_STORAGE_KEY__ || void 0;
const sdk = new Medusa__default.default({
  baseUrl: backendUrl,
  auth: {
    type: authType,
    jwtTokenStorageKey
  }
});
const CUSTOMER_QUERY_KEY = "customers";
const customersQueryKeys = {
  list: (query2) => [
    CUSTOMER_QUERY_KEY,
    query2 ? query2 : void 0
  ],
  detail: (id, query2) => [
    CUSTOMER_QUERY_KEY,
    id,
    query2 ? query2 : void 0
  ],
  addresses: (id, query2) => [
    CUSTOMER_QUERY_KEY,
    id,
    "addresses",
    query2 ? query2 : void 0
  ],
  address: (id, addressId, query2) => [
    CUSTOMER_QUERY_KEY,
    id,
    "addresses",
    addressId,
    query2 ? query2 : void 0
  ]
};
const useCustomer = (id, query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryKey: customersQueryKeys.detail(id, query2),
    queryFn: async () => sdk.admin.customer.retrieve(id, query2),
    ...options
  });
  return { ...data, ...rest };
};
const useCustomers = (query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryKey: customersQueryKeys.list(query2),
    queryFn: async () => sdk.admin.customer.list(query2),
    ...options
  });
  return { ...data, ...rest };
};
const useCustomerAddress = (id, addressId, query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryKey: customersQueryKeys.address(id, addressId, query2),
    queryFn: async () => {
      const response = await sdk.client.fetch(
        "/admin/customers/" + id + "/addresses/" + addressId
      );
      return response;
    },
    ...options
  });
  return { ...data, ...rest };
};
const ORDERS_QUERY_KEY = "orders";
const ordersQueryKeys = {
  detail: (id, query2) => [
    ORDERS_QUERY_KEY,
    "details",
    id,
    query2 ? { query: query2 } : void 0
  ],
  details: () => [ORDERS_QUERY_KEY, "details"],
  list: (query2) => [
    ORDERS_QUERY_KEY,
    "lists",
    query2 ? { query: query2 } : void 0
  ],
  lists: () => [ORDERS_QUERY_KEY, "lists"],
  preview: (id) => [ORDERS_QUERY_KEY, "preview", id],
  changes: (id) => [ORDERS_QUERY_KEY, "changes", id]
};
const useOrder = (id, query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryKey: ordersQueryKeys.detail(id, query2),
    queryFn: async () => sdk.admin.order.retrieve(id, query2),
    ...options
  });
  return { ...data, ...rest };
};
const useOrderChanges = (id, query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryFn: async () => sdk.admin.order.listChanges(id, query2),
    queryKey: ordersQueryKeys.changes(id),
    ...options
  });
  return { ...data, ...rest };
};
const useOrderPreview = (id, query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryFn: async () => sdk.admin.order.retrievePreview(id, query2),
    queryKey: ordersQueryKeys.preview(id),
    ...options
  });
  return { ...data, ...rest };
};
const useOrderEditRequest = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: () => sdk.admin.orderEdit.request(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(id)
      });
    },
    ...options
  });
};
const SHIPPING_OPTION_QUERY_KEY = "shipping-options";
const shippingOptionsQueryKeys = {
  list: (query2) => [
    SHIPPING_OPTION_QUERY_KEY,
    query2 ? query2 : void 0
  ],
  detail: (id, query2) => [
    SHIPPING_OPTION_QUERY_KEY,
    id,
    query2 ? query2 : void 0
  ]
};
const useShippingOptions = (query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryKey: shippingOptionsQueryKeys.list(query2),
    queryFn: async () => sdk.admin.shippingOption.list(query2),
    ...options
  });
  return { ...data, ...rest };
};
const DRAFT_ORDERS_QUERY_KEY = "draft-orders";
const draftOrdersQueryKeys = {
  detail: (id, query2) => [
    DRAFT_ORDERS_QUERY_KEY,
    "details",
    id,
    query2 ? { query: query2 } : void 0
  ],
  details: () => [DRAFT_ORDERS_QUERY_KEY, "details"],
  list: (query2) => [
    DRAFT_ORDERS_QUERY_KEY,
    "lists",
    query2 ? { query: query2 } : void 0
  ],
  lists: () => [DRAFT_ORDERS_QUERY_KEY, "lists"]
};
const useDraftOrders = (query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryFn: async () => {
      return await sdk.admin.draftOrder.list(query2);
    },
    queryKey: draftOrdersQueryKeys.list(query2),
    ...options
  });
  return { ...data, ...rest };
};
const useDraftOrder = (id, query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryFn: async () => {
      return await sdk.admin.draftOrder.retrieve(id, query2);
    },
    queryKey: draftOrdersQueryKeys.detail(id, query2),
    ...options
  });
  return { ...data, ...rest };
};
const useCreateDraftOrder = (options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: async (payload) => {
      return await sdk.admin.draftOrder.create(payload);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrdersQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: shippingOptionsQueryKeys.list()
      });
    },
    ...options
  });
};
const useDeleteDraftOrder = (options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: async (id) => {
      return await sdk.admin.draftOrder.delete(id);
    },
    onSuccess: (data, undefined2, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrdersQueryKeys.lists()
      });
    },
    ...options
  });
};
const useUpdateDraftOrder = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: async (payload) => {
      return await sdk.admin.draftOrder.update(id, payload);
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrdersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: draftOrdersQueryKeys.lists()
      });
    },
    ...options
  });
};
const useConvertDraftOrder = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: () => sdk.admin.draftOrder.convertToOrder(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: draftOrdersQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({
        queryKey: draftOrdersQueryKeys.lists()
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.lists()
      });
    },
    ...options
  });
};
const useDraftOrderAddItems = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: (payload) => sdk.admin.draftOrder.addItems(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
    },
    ...options
  });
};
const useDraftOrderUpdateItem = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: ({ item_id, ...payload }) => sdk.admin.draftOrder.updateItem(id, item_id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
    },
    ...options
  });
};
const useDraftOrderRemoveActionItem = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: (action_id) => sdk.admin.draftOrder.removeActionItem(id, action_id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
    },
    ...options
  });
};
const useDraftOrderUpdateActionItem = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: ({ action_id, ...payload }) => sdk.admin.draftOrder.updateActionItem(id, action_id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
    },
    ...options
  });
};
const useDraftOrderAddPromotions = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: (payload) => sdk.admin.draftOrder.addPromotions(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
    },
    ...options
  });
};
const useDraftOrderRemovePromotions = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: (payload) => sdk.admin.draftOrder.removePromotions(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
    },
    ...options
  });
};
const useDraftOrderAddShippingMethod = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: (payload) => sdk.admin.draftOrder.addShippingMethod(id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
    },
    ...options
  });
};
const useDraftOrderRemoveActionShippingMethod = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: (action_id) => sdk.admin.draftOrder.removeActionShippingMethod(id, action_id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
    },
    ...options
  });
};
const useDraftOrderRemoveShippingMethod = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: (shipping_method_id) => sdk.admin.draftOrder.removeShippingMethod(id, shipping_method_id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
    },
    ...options
  });
};
const useDraftOrderUpdateShippingMethod = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: ({ method_id, ...payload }) => sdk.admin.draftOrder.updateShippingMethod(id, method_id, payload),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
    },
    ...options
  });
};
const useDraftOrderBeginEdit = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: () => sdk.admin.draftOrder.beginEdit(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
    },
    ...options
  });
};
const useDraftOrderCancelEdit = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: () => sdk.admin.draftOrder.cancelEdit(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: draftOrdersQueryKeys.details()
      });
    },
    ...options
  });
};
const useDraftOrderRequestEdit = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: () => sdk.admin.draftOrder.requestEdit(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
    },
    ...options
  });
};
const useDraftOrderConfirmEdit = (id, options) => {
  const queryClient = reactQuery.useQueryClient();
  return reactQuery.useMutation({
    mutationFn: () => sdk.admin.draftOrder.confirmEdit(id),
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.preview(id)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.changes(id)
      });
      queryClient.invalidateQueries({
        queryKey: ordersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: draftOrdersQueryKeys.detail(id)
      });
      queryClient.invalidateQueries({
        queryKey: draftOrdersQueryKeys.details()
      });
      queryClient.invalidateQueries({
        queryKey: draftOrdersQueryKeys.lists()
      });
    },
    ...options
  });
};
const REGION_QUERY_KEY = "regions";
const regionsQueryKeys = {
  list: (query2) => [
    REGION_QUERY_KEY,
    query2 ? query2 : void 0
  ],
  detail: (id, query2) => [
    REGION_QUERY_KEY,
    id,
    query2 ? query2 : void 0
  ]
};
const useRegion = (id, query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryKey: regionsQueryKeys.detail(id, query2),
    queryFn: async () => sdk.admin.region.retrieve(id, query2),
    ...options
  });
  return { ...data, ...rest };
};
const useRegions = (query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryKey: regionsQueryKeys.list(query2),
    queryFn: async () => sdk.admin.region.list(query2),
    ...options
  });
  return { ...data, ...rest };
};
const SALES_CHANNEL_QUERY_KEY = "sales-channels";
const salesChannelsQueryKeys = {
  list: (query2) => [
    SALES_CHANNEL_QUERY_KEY,
    query2 ? query2 : void 0
  ],
  detail: (id, query2) => [
    SALES_CHANNEL_QUERY_KEY,
    id,
    query2 ? query2 : void 0
  ]
};
const useSalesChannels = (query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryKey: salesChannelsQueryKeys.list(query2),
    queryFn: async () => sdk.admin.salesChannel.list(query2),
    ...options
  });
  return { ...data, ...rest };
};
function getRelativeDate(date, locale$1 = locale.enUS) {
  const now = /* @__PURE__ */ new Date();
  return dateFns.formatDistance(dateFns.sub(new Date(date), { minutes: 0 }), now, {
    addSuffix: true,
    locale: locale$1
  });
}
const getFullDate = ({
  date,
  includeTime = false,
  locale: locale$1 = locale.enUS
}) => {
  const ensuredDate = new Date(date);
  if (isNaN(ensuredDate.getTime())) {
    return "";
  }
  const timeFormat = includeTime ? "p" : "";
  return dateFns.format(ensuredDate, `PP ${timeFormat}`, {
    locale: locale$1
  });
};
const useDate = () => {
  const { i18n } = reactI18next.useTranslation();
  const locale2 = getDateLocale(i18n.language);
  const fullDate = React.useCallback(
    ({ date, includeTime }) => getFullDate({ date, includeTime, locale: locale2 }),
    [locale2]
  );
  const relativeDate = React.useCallback(
    (date) => getRelativeDate(date, locale2),
    [locale2]
  );
  return { getFullDate: fullDate, getRelativeDate: relativeDate };
};
const filterHelper = ui.createDataTableFilterHelper();
const useDateFilterOptions = () => {
  const { t } = reactI18next.useTranslation();
  const today = React.useMemo(() => {
    const date = /* @__PURE__ */ new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);
  return React.useMemo(() => {
    return [
      {
        label: t("draftOrdersPlugin.dateFilters.today"),
        value: {
          $gte: today.toISOString()
        }
      },
      {
        label: t("draftOrdersPlugin.dateFilters.last7Days"),
        value: {
          $gte: dateFns.subDays(today, 7).toISOString()
          // 7 days ago
        }
      },
      {
        label: t("draftOrdersPlugin.dateFilters.last30Days"),
        value: {
          $gte: dateFns.subDays(today, 30).toISOString()
          // 30 days ago
        }
      },
      {
        label: t("draftOrdersPlugin.dateFilters.last90Days"),
        value: {
          $gte: dateFns.subDays(today, 90).toISOString()
          // 90 days ago
        }
      },
      {
        label: t("draftOrdersPlugin.dateFilters.last12Months"),
        value: {
          $gte: dateFns.subMonths(today, 12).toISOString()
          // 12 months ago
        }
      }
    ];
  }, [today, t]);
};
const useDataTableDateFilters = (disableRangeOption) => {
  const { t } = reactI18next.useTranslation();
  const { getFullDate: getFullDate2 } = useDate();
  const dateFilterOptions = useDateFilterOptions();
  const rangeOptions = React.useMemo(() => {
    return {
      rangeOptionStartLabel: t("draftOrdersPlugin.dateFilters.starting"),
      rangeOptionEndLabel: t("draftOrdersPlugin.dateFilters.ending"),
      rangeOptionLabel: t("draftOrdersPlugin.dateFilters.custom"),
      options: dateFilterOptions
    };
  }, [disableRangeOption, dateFilterOptions, t]);
  return React.useMemo(() => {
    return [
      filterHelper.accessor("created_at", {
        type: "date",
        label: t("draftOrdersPlugin.dateFilters.createdAt"),
        format: "date",
        formatDateValue: (date) => getFullDate2({ date }),
        options: dateFilterOptions,
        ...rangeOptions
      }),
      filterHelper.accessor("updated_at", {
        type: "date",
        label: t("draftOrdersPlugin.dateFilters.updatedAt"),
        format: "date",
        formatDateValue: (date) => getFullDate2({ date }),
        options: dateFilterOptions,
        ...rangeOptions
      })
    ];
  }, [dateFilterOptions, getFullDate2, rangeOptions, t]);
};
const PAGE_SIZE = 20;
const Breadcrumb = () => {
  const { t } = reactI18next.useTranslation();
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: t("draftOrders.domain") });
};
const handle$1 = {
  breadcrumb: () => /* @__PURE__ */ jsxRuntime.jsx(Breadcrumb, {})
};
const List = () => {
  const { t } = reactI18next.useTranslation();
  const queryParams = useDraftOrderTableQuery({
    pageSize: PAGE_SIZE
  });
  const { draft_orders, count, isPending, isError, error } = useDraftOrders(
    {
      ...queryParams,
      order: queryParams.order ?? "-created_at",
      fields: "+customer.*,+sales_channel.*,+email,+display_id,+total,+currency_code,+shipping_total,+tax_total,+discount_total,+items.*,+items.variant.*,+items.variant.product.*,+items.variant.product.shipping_profile.*,+items.variant.options.*,+region.*"
    },
    {
      placeholderData: reactQuery.keepPreviousData
    }
  );
  const columns = useColumns$1();
  const filters = useFilters();
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    components.LayoutComposer,
    {
      widgetsZonePrefix: "draft_order.list",
      preferredLayoutId: "core:single-column",
      sections: {
        main: /* @__PURE__ */ jsxRuntime.jsx(components.LayoutComposer.Entry, { id: "DraftOrderListTable", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Container, { className: "p-0", children: /* @__PURE__ */ jsxRuntime.jsx(
          DataTable,
          {
            data: draft_orders,
            getRowId: (row) => row.id,
            columns,
            filters,
            isLoading: isPending,
            pageSize: PAGE_SIZE,
            rowCount: count,
            heading: t("draftOrders.domain"),
            action: {
              label: t("actions.create"),
              to: "create"
            },
            rowHref: (row) => `${row.id}`,
            emptyState: {
              empty: {
                heading: t("draftOrders.list.noRecordsMessage"),
                description: t("draftOrders.list.description")
              },
              filtered: {
                heading: t("draftOrders.list.filtered.heading"),
                description: t("draftOrders.list.filtered.description")
              }
            }
          }
        ) }) })
      }
    }
  );
};
const config = adminSdk.defineRouteConfig({
  label: "draftOrdersPlugin.menu.drafts",
  translationNs: "translation",
  nested: "/orders"
});
const columnHelper$1 = ui.createDataTableColumnHelper();
const useColumns$1 = () => {
  const { t } = reactI18next.useTranslation();
  const { getFullDate: getFullDate2 } = useDate();
  return React.useMemo(
    () => [
      columnHelper$1.accessor("display_id", {
        header: t("draftOrdersPlugin.list.columns.displayId"),
        cell: ({ getValue }) => {
          return `#${getValue()}`;
        },
        enableSorting: true
      }),
      columnHelper$1.accessor("created_at", {
        header: t("draftOrdersPlugin.list.columns.date"),
        cell: ({ getValue }) => {
          return /* @__PURE__ */ jsxRuntime.jsx(
            ui.Tooltip,
            {
              content: getFullDate2({ date: getValue(), includeTime: true }),
              children: /* @__PURE__ */ jsxRuntime.jsx("span", { children: getFullDate2({ date: getValue() }) })
            }
          );
        },
        enableSorting: true
      }),
      columnHelper$1.accessor("customer_id", {
        header: t("draftOrdersPlugin.fields.customer"),
        cell: ({ row }) => {
          return row.original.customer?.email || "-";
        },
        enableSorting: true
      }),
      columnHelper$1.accessor("sales_channel_id", {
        header: t("draftOrdersPlugin.fields.salesChannel"),
        cell: ({ row }) => {
          return row.original.sales_channel?.name || "-";
        },
        enableSorting: true
      }),
      columnHelper$1.accessor("region_id", {
        header: t("draftOrdersPlugin.fields.region"),
        cell: ({ row }) => {
          return row.original.region?.name || "-";
        },
        enableSorting: true
      })
    ],
    [t, getFullDate2]
  );
};
const useFilters = () => {
  const { t } = reactI18next.useTranslation();
  const dateFilterOptions = useDataTableDateFilters();
  const { customers } = useCustomers(
    {
      limit: 1e3,
      fields: "id,email"
    },
    {
      throwOnError: true
    }
  );
  const { sales_channels } = useSalesChannels(
    {
      limit: 1e3,
      fields: "id,name"
    },
    {
      throwOnError: true
    }
  );
  const { regions } = useRegions(
    {
      limit: 1e3,
      fields: "id,name"
    },
    { throwOnError: true }
  );
  return React.useMemo(() => {
    return [
      {
        id: "customer_id",
        label: t("draftOrdersPlugin.fields.customer"),
        options: customers?.map((customer) => ({
          label: customer.email,
          value: customer.id
        })) ?? [],
        type: "select"
      },
      {
        id: "sales_channel_id",
        label: t("draftOrdersPlugin.fields.salesChannel"),
        options: sales_channels?.map((sales_channel) => ({
          label: sales_channel.name,
          value: sales_channel.id
        })) ?? [],
        type: "select"
      },
      {
        id: "region_id",
        label: t("draftOrdersPlugin.fields.region"),
        options: regions?.map((region) => ({
          label: region.name,
          value: region.id
        })) ?? [],
        type: "select"
      },
      ...dateFilterOptions
    ];
  }, [customers, sales_channels, regions, dateFilterOptions, t]);
};
const useDraftOrderTableQuery = ({
  prefix,
  pageSize = 20
}) => {
  const queryObject = useQueryParams(
    [
      "offset",
      "q",
      "order",
      "customer_id",
      "region_id",
      "created_at",
      "updated_at"
    ],
    prefix
  );
  const { offset, created_at, updated_at, ...rest } = queryObject;
  const searchParams = {
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    created_at: created_at ? JSON.parse(created_at) : void 0,
    updated_at: updated_at ? JSON.parse(updated_at) : void 0,
    ...rest
  };
  return searchParams;
};
const useCountryName = () => {
  const { i18n } = reactI18next.useTranslation();
  const language = i18n.language;
  const displayNames = React.useMemo(() => {
    if (!language || language === "en") {
      return null;
    }
    try {
      return new Intl.DisplayNames([toLocaleTag(language)], { type: "region" });
    } catch {
      return null;
    }
  }, [language]);
  return React.useCallback(
    (iso2, fallback) => {
      if (!displayNames) {
        return fallback;
      }
      try {
        return displayNames.of(iso2.toUpperCase()) ?? fallback;
      } catch {
        return fallback;
      }
    },
    [displayNames]
  );
};
function getCountryByIso2(iso2) {
  if (!iso2) {
    return;
  }
  return countries.find((c) => c.iso_2.toLowerCase() === iso2.toLowerCase());
}
const countries = [
  {
    iso_2: "af",
    iso_3: "afg",
    num_code: "4",
    name: "AFGHANISTAN",
    display_name: "Afghanistan"
  },
  {
    iso_2: "al",
    iso_3: "alb",
    num_code: "8",
    name: "ALBANIA",
    display_name: "Albania"
  },
  {
    iso_2: "dz",
    iso_3: "dza",
    num_code: "12",
    name: "ALGERIA",
    display_name: "Algeria"
  },
  {
    iso_2: "as",
    iso_3: "asm",
    num_code: "16",
    name: "AMERICAN SAMOA",
    display_name: "American Samoa"
  },
  {
    iso_2: "ad",
    iso_3: "and",
    num_code: "20",
    name: "ANDORRA",
    display_name: "Andorra"
  },
  {
    iso_2: "ao",
    iso_3: "ago",
    num_code: "24",
    name: "ANGOLA",
    display_name: "Angola"
  },
  {
    iso_2: "ai",
    iso_3: "aia",
    num_code: "660",
    name: "ANGUILLA",
    display_name: "Anguilla"
  },
  {
    iso_2: "aq",
    iso_3: "ata",
    num_code: "10",
    name: "ANTARCTICA",
    display_name: "Antarctica"
  },
  {
    iso_2: "ag",
    iso_3: "atg",
    num_code: "28",
    name: "ANTIGUA AND BARBUDA",
    display_name: "Antigua and Barbuda"
  },
  {
    iso_2: "ar",
    iso_3: "arg",
    num_code: "32",
    name: "ARGENTINA",
    display_name: "Argentina"
  },
  {
    iso_2: "am",
    iso_3: "arm",
    num_code: "51",
    name: "ARMENIA",
    display_name: "Armenia"
  },
  {
    iso_2: "aw",
    iso_3: "abw",
    num_code: "533",
    name: "ARUBA",
    display_name: "Aruba"
  },
  {
    iso_2: "au",
    iso_3: "aus",
    num_code: "36",
    name: "AUSTRALIA",
    display_name: "Australia"
  },
  {
    iso_2: "at",
    iso_3: "aut",
    num_code: "40",
    name: "AUSTRIA",
    display_name: "Austria"
  },
  {
    iso_2: "az",
    iso_3: "aze",
    num_code: "31",
    name: "AZERBAIJAN",
    display_name: "Azerbaijan"
  },
  {
    iso_2: "bs",
    iso_3: "bhs",
    num_code: "44",
    name: "BAHAMAS",
    display_name: "Bahamas"
  },
  {
    iso_2: "bh",
    iso_3: "bhr",
    num_code: "48",
    name: "BAHRAIN",
    display_name: "Bahrain"
  },
  {
    iso_2: "bd",
    iso_3: "bgd",
    num_code: "50",
    name: "BANGLADESH",
    display_name: "Bangladesh"
  },
  {
    iso_2: "bb",
    iso_3: "brb",
    num_code: "52",
    name: "BARBADOS",
    display_name: "Barbados"
  },
  {
    iso_2: "by",
    iso_3: "blr",
    num_code: "112",
    name: "BELARUS",
    display_name: "Belarus"
  },
  {
    iso_2: "be",
    iso_3: "bel",
    num_code: "56",
    name: "BELGIUM",
    display_name: "Belgium"
  },
  {
    iso_2: "bz",
    iso_3: "blz",
    num_code: "84",
    name: "BELIZE",
    display_name: "Belize"
  },
  {
    iso_2: "bj",
    iso_3: "ben",
    num_code: "204",
    name: "BENIN",
    display_name: "Benin"
  },
  {
    iso_2: "bm",
    iso_3: "bmu",
    num_code: "60",
    name: "BERMUDA",
    display_name: "Bermuda"
  },
  {
    iso_2: "bt",
    iso_3: "btn",
    num_code: "64",
    name: "BHUTAN",
    display_name: "Bhutan"
  },
  {
    iso_2: "bo",
    iso_3: "bol",
    num_code: "68",
    name: "BOLIVIA",
    display_name: "Bolivia"
  },
  {
    iso_2: "bq",
    iso_3: "bes",
    num_code: "535",
    name: "BONAIRE, SINT EUSTATIUS AND SABA",
    display_name: "Bonaire, Sint Eustatius and Saba"
  },
  {
    iso_2: "ba",
    iso_3: "bih",
    num_code: "70",
    name: "BOSNIA AND HERZEGOVINA",
    display_name: "Bosnia and Herzegovina"
  },
  {
    iso_2: "bw",
    iso_3: "bwa",
    num_code: "72",
    name: "BOTSWANA",
    display_name: "Botswana"
  },
  {
    iso_2: "bv",
    iso_3: "bvd",
    num_code: "74",
    name: "BOUVET ISLAND",
    display_name: "Bouvet Island"
  },
  {
    iso_2: "br",
    iso_3: "bra",
    num_code: "76",
    name: "BRAZIL",
    display_name: "Brazil"
  },
  {
    iso_2: "io",
    iso_3: "iot",
    num_code: "86",
    name: "BRITISH INDIAN OCEAN TERRITORY",
    display_name: "British Indian Ocean Territory"
  },
  {
    iso_2: "bn",
    iso_3: "brn",
    num_code: "96",
    name: "BRUNEI DARUSSALAM",
    display_name: "Brunei Darussalam"
  },
  {
    iso_2: "bg",
    iso_3: "bgr",
    num_code: "100",
    name: "BULGARIA",
    display_name: "Bulgaria"
  },
  {
    iso_2: "bf",
    iso_3: "bfa",
    num_code: "854",
    name: "BURKINA FASO",
    display_name: "Burkina Faso"
  },
  {
    iso_2: "bi",
    iso_3: "bdi",
    num_code: "108",
    name: "BURUNDI",
    display_name: "Burundi"
  },
  {
    iso_2: "kh",
    iso_3: "khm",
    num_code: "116",
    name: "CAMBODIA",
    display_name: "Cambodia"
  },
  {
    iso_2: "cm",
    iso_3: "cmr",
    num_code: "120",
    name: "CAMEROON",
    display_name: "Cameroon"
  },
  {
    iso_2: "ca",
    iso_3: "can",
    num_code: "124",
    name: "CANADA",
    display_name: "Canada"
  },
  {
    iso_2: "cv",
    iso_3: "cpv",
    num_code: "132",
    name: "CAPE VERDE",
    display_name: "Cape Verde"
  },
  {
    iso_2: "ky",
    iso_3: "cym",
    num_code: "136",
    name: "CAYMAN ISLANDS",
    display_name: "Cayman Islands"
  },
  {
    iso_2: "cf",
    iso_3: "caf",
    num_code: "140",
    name: "CENTRAL AFRICAN REPUBLIC",
    display_name: "Central African Republic"
  },
  {
    iso_2: "td",
    iso_3: "tcd",
    num_code: "148",
    name: "CHAD",
    display_name: "Chad"
  },
  {
    iso_2: "cl",
    iso_3: "chl",
    num_code: "152",
    name: "CHILE",
    display_name: "Chile"
  },
  {
    iso_2: "cn",
    iso_3: "chn",
    num_code: "156",
    name: "CHINA",
    display_name: "China"
  },
  {
    iso_2: "cx",
    iso_3: "cxr",
    num_code: "162",
    name: "CHRISTMAS ISLAND",
    display_name: "Christmas Island"
  },
  {
    iso_2: "cc",
    iso_3: "cck",
    num_code: "166",
    name: "COCOS (KEELING) ISLANDS",
    display_name: "Cocos (Keeling) Islands"
  },
  {
    iso_2: "co",
    iso_3: "col",
    num_code: "170",
    name: "COLOMBIA",
    display_name: "Colombia"
  },
  {
    iso_2: "km",
    iso_3: "com",
    num_code: "174",
    name: "COMOROS",
    display_name: "Comoros"
  },
  {
    iso_2: "cg",
    iso_3: "cog",
    num_code: "178",
    name: "CONGO",
    display_name: "Congo"
  },
  {
    iso_2: "cd",
    iso_3: "cod",
    num_code: "180",
    name: "CONGO, THE DEMOCRATIC REPUBLIC OF THE",
    display_name: "Congo, the Democratic Republic of the"
  },
  {
    iso_2: "ck",
    iso_3: "cok",
    num_code: "184",
    name: "COOK ISLANDS",
    display_name: "Cook Islands"
  },
  {
    iso_2: "cr",
    iso_3: "cri",
    num_code: "188",
    name: "COSTA RICA",
    display_name: "Costa Rica"
  },
  {
    iso_2: "ci",
    iso_3: "civ",
    num_code: "384",
    name: "COTE D'IVOIRE",
    display_name: "Cote D'Ivoire"
  },
  {
    iso_2: "hr",
    iso_3: "hrv",
    num_code: "191",
    name: "CROATIA",
    display_name: "Croatia"
  },
  {
    iso_2: "cu",
    iso_3: "cub",
    num_code: "192",
    name: "CUBA",
    display_name: "Cuba"
  },
  {
    iso_2: "cw",
    iso_3: "cuw",
    num_code: "531",
    name: "CURAÇAO",
    display_name: "Curaçao"
  },
  {
    iso_2: "cy",
    iso_3: "cyp",
    num_code: "196",
    name: "CYPRUS",
    display_name: "Cyprus"
  },
  {
    iso_2: "cz",
    iso_3: "cze",
    num_code: "203",
    name: "CZECH REPUBLIC",
    display_name: "Czech Republic"
  },
  {
    iso_2: "dk",
    iso_3: "dnk",
    num_code: "208",
    name: "DENMARK",
    display_name: "Denmark"
  },
  {
    iso_2: "dj",
    iso_3: "dji",
    num_code: "262",
    name: "DJIBOUTI",
    display_name: "Djibouti"
  },
  {
    iso_2: "dm",
    iso_3: "dma",
    num_code: "212",
    name: "DOMINICA",
    display_name: "Dominica"
  },
  {
    iso_2: "do",
    iso_3: "dom",
    num_code: "214",
    name: "DOMINICAN REPUBLIC",
    display_name: "Dominican Republic"
  },
  {
    iso_2: "ec",
    iso_3: "ecu",
    num_code: "218",
    name: "ECUADOR",
    display_name: "Ecuador"
  },
  {
    iso_2: "eg",
    iso_3: "egy",
    num_code: "818",
    name: "EGYPT",
    display_name: "Egypt"
  },
  {
    iso_2: "sv",
    iso_3: "slv",
    num_code: "222",
    name: "EL SALVADOR",
    display_name: "El Salvador"
  },
  {
    iso_2: "gq",
    iso_3: "gnq",
    num_code: "226",
    name: "EQUATORIAL GUINEA",
    display_name: "Equatorial Guinea"
  },
  {
    iso_2: "er",
    iso_3: "eri",
    num_code: "232",
    name: "ERITREA",
    display_name: "Eritrea"
  },
  {
    iso_2: "ee",
    iso_3: "est",
    num_code: "233",
    name: "ESTONIA",
    display_name: "Estonia"
  },
  {
    iso_2: "et",
    iso_3: "eth",
    num_code: "231",
    name: "ETHIOPIA",
    display_name: "Ethiopia"
  },
  {
    iso_2: "fk",
    iso_3: "flk",
    num_code: "238",
    name: "FALKLAND ISLANDS (MALVINAS)",
    display_name: "Falkland Islands (Malvinas)"
  },
  {
    iso_2: "fo",
    iso_3: "fro",
    num_code: "234",
    name: "FAROE ISLANDS",
    display_name: "Faroe Islands"
  },
  {
    iso_2: "fj",
    iso_3: "fji",
    num_code: "242",
    name: "FIJI",
    display_name: "Fiji"
  },
  {
    iso_2: "fi",
    iso_3: "fin",
    num_code: "246",
    name: "FINLAND",
    display_name: "Finland"
  },
  {
    iso_2: "fr",
    iso_3: "fra",
    num_code: "250",
    name: "FRANCE",
    display_name: "France"
  },
  {
    iso_2: "gf",
    iso_3: "guf",
    num_code: "254",
    name: "FRENCH GUIANA",
    display_name: "French Guiana"
  },
  {
    iso_2: "pf",
    iso_3: "pyf",
    num_code: "258",
    name: "FRENCH POLYNESIA",
    display_name: "French Polynesia"
  },
  {
    iso_2: "tf",
    iso_3: "atf",
    num_code: "260",
    name: "FRENCH SOUTHERN TERRITORIES",
    display_name: "French Southern Territories"
  },
  {
    iso_2: "ga",
    iso_3: "gab",
    num_code: "266",
    name: "GABON",
    display_name: "Gabon"
  },
  {
    iso_2: "gm",
    iso_3: "gmb",
    num_code: "270",
    name: "GAMBIA",
    display_name: "Gambia"
  },
  {
    iso_2: "ge",
    iso_3: "geo",
    num_code: "268",
    name: "GEORGIA",
    display_name: "Georgia"
  },
  {
    iso_2: "de",
    iso_3: "deu",
    num_code: "276",
    name: "GERMANY",
    display_name: "Germany"
  },
  {
    iso_2: "gh",
    iso_3: "gha",
    num_code: "288",
    name: "GHANA",
    display_name: "Ghana"
  },
  {
    iso_2: "gi",
    iso_3: "gib",
    num_code: "292",
    name: "GIBRALTAR",
    display_name: "Gibraltar"
  },
  {
    iso_2: "gr",
    iso_3: "grc",
    num_code: "300",
    name: "GREECE",
    display_name: "Greece"
  },
  {
    iso_2: "gl",
    iso_3: "grl",
    num_code: "304",
    name: "GREENLAND",
    display_name: "Greenland"
  },
  {
    iso_2: "gd",
    iso_3: "grd",
    num_code: "308",
    name: "GRENADA",
    display_name: "Grenada"
  },
  {
    iso_2: "gp",
    iso_3: "glp",
    num_code: "312",
    name: "GUADELOUPE",
    display_name: "Guadeloupe"
  },
  {
    iso_2: "gu",
    iso_3: "gum",
    num_code: "316",
    name: "GUAM",
    display_name: "Guam"
  },
  {
    iso_2: "gt",
    iso_3: "gtm",
    num_code: "320",
    name: "GUATEMALA",
    display_name: "Guatemala"
  },
  {
    iso_2: "gg",
    iso_3: "ggy",
    num_code: "831",
    name: "GUERNSEY",
    display_name: "Guernsey"
  },
  {
    iso_2: "gn",
    iso_3: "gin",
    num_code: "324",
    name: "GUINEA",
    display_name: "Guinea"
  },
  {
    iso_2: "gw",
    iso_3: "gnb",
    num_code: "624",
    name: "GUINEA-BISSAU",
    display_name: "Guinea-Bissau"
  },
  {
    iso_2: "gy",
    iso_3: "guy",
    num_code: "328",
    name: "GUYANA",
    display_name: "Guyana"
  },
  {
    iso_2: "ht",
    iso_3: "hti",
    num_code: "332",
    name: "HAITI",
    display_name: "Haiti"
  },
  {
    iso_2: "hm",
    iso_3: "hmd",
    num_code: "334",
    name: "HEARD ISLAND AND MCDONALD ISLANDS",
    display_name: "Heard Island And Mcdonald Islands"
  },
  {
    iso_2: "va",
    iso_3: "vat",
    num_code: "336",
    name: "HOLY SEE (VATICAN CITY STATE)",
    display_name: "Holy See (Vatican City State)"
  },
  {
    iso_2: "hn",
    iso_3: "hnd",
    num_code: "340",
    name: "HONDURAS",
    display_name: "Honduras"
  },
  {
    iso_2: "hk",
    iso_3: "hkg",
    num_code: "344",
    name: "HONG KONG",
    display_name: "Hong Kong"
  },
  {
    iso_2: "hu",
    iso_3: "hun",
    num_code: "348",
    name: "HUNGARY",
    display_name: "Hungary"
  },
  {
    iso_2: "is",
    iso_3: "isl",
    num_code: "352",
    name: "ICELAND",
    display_name: "Iceland"
  },
  {
    iso_2: "in",
    iso_3: "ind",
    num_code: "356",
    name: "INDIA",
    display_name: "India"
  },
  {
    iso_2: "id",
    iso_3: "idn",
    num_code: "360",
    name: "INDONESIA",
    display_name: "Indonesia"
  },
  {
    iso_2: "ir",
    iso_3: "irn",
    num_code: "364",
    name: "IRAN, ISLAMIC REPUBLIC OF",
    display_name: "Iran, Islamic Republic of"
  },
  {
    iso_2: "iq",
    iso_3: "irq",
    num_code: "368",
    name: "IRAQ",
    display_name: "Iraq"
  },
  {
    iso_2: "ie",
    iso_3: "irl",
    num_code: "372",
    name: "IRELAND",
    display_name: "Ireland"
  },
  {
    iso_2: "im",
    iso_3: "imn",
    num_code: "833",
    name: "ISLE OF MAN",
    display_name: "Isle Of Man"
  },
  {
    iso_2: "il",
    iso_3: "isr",
    num_code: "376",
    name: "ISRAEL",
    display_name: "Israel"
  },
  {
    iso_2: "it",
    iso_3: "ita",
    num_code: "380",
    name: "ITALY",
    display_name: "Italy"
  },
  {
    iso_2: "jm",
    iso_3: "jam",
    num_code: "388",
    name: "JAMAICA",
    display_name: "Jamaica"
  },
  {
    iso_2: "jp",
    iso_3: "jpn",
    num_code: "392",
    name: "JAPAN",
    display_name: "Japan"
  },
  {
    iso_2: "je",
    iso_3: "jey",
    num_code: "832",
    name: "JERSEY",
    display_name: "Jersey"
  },
  {
    iso_2: "jo",
    iso_3: "jor",
    num_code: "400",
    name: "JORDAN",
    display_name: "Jordan"
  },
  {
    iso_2: "kz",
    iso_3: "kaz",
    num_code: "398",
    name: "KAZAKHSTAN",
    display_name: "Kazakhstan"
  },
  {
    iso_2: "ke",
    iso_3: "ken",
    num_code: "404",
    name: "KENYA",
    display_name: "Kenya"
  },
  {
    iso_2: "ki",
    iso_3: "kir",
    num_code: "296",
    name: "KIRIBATI",
    display_name: "Kiribati"
  },
  {
    iso_2: "kp",
    iso_3: "prk",
    num_code: "408",
    name: "KOREA, DEMOCRATIC PEOPLE'S REPUBLIC OF",
    display_name: "Korea, Democratic People's Republic of"
  },
  {
    iso_2: "kr",
    iso_3: "kor",
    num_code: "410",
    name: "KOREA, REPUBLIC OF",
    display_name: "Korea, Republic of"
  },
  {
    iso_2: "xk",
    iso_3: "xkx",
    num_code: "900",
    name: "KOSOVO",
    display_name: "Kosovo"
  },
  {
    iso_2: "kw",
    iso_3: "kwt",
    num_code: "414",
    name: "KUWAIT",
    display_name: "Kuwait"
  },
  {
    iso_2: "kg",
    iso_3: "kgz",
    num_code: "417",
    name: "KYRGYZSTAN",
    display_name: "Kyrgyzstan"
  },
  {
    iso_2: "la",
    iso_3: "lao",
    num_code: "418",
    name: "LAO PEOPLE'S DEMOCRATIC REPUBLIC",
    display_name: "Lao People's Democratic Republic"
  },
  {
    iso_2: "lv",
    iso_3: "lva",
    num_code: "428",
    name: "LATVIA",
    display_name: "Latvia"
  },
  {
    iso_2: "lb",
    iso_3: "lbn",
    num_code: "422",
    name: "LEBANON",
    display_name: "Lebanon"
  },
  {
    iso_2: "ls",
    iso_3: "lso",
    num_code: "426",
    name: "LESOTHO",
    display_name: "Lesotho"
  },
  {
    iso_2: "lr",
    iso_3: "lbr",
    num_code: "430",
    name: "LIBERIA",
    display_name: "Liberia"
  },
  {
    iso_2: "ly",
    iso_3: "lby",
    num_code: "434",
    name: "LIBYA",
    display_name: "Libya"
  },
  {
    iso_2: "li",
    iso_3: "lie",
    num_code: "438",
    name: "LIECHTENSTEIN",
    display_name: "Liechtenstein"
  },
  {
    iso_2: "lt",
    iso_3: "ltu",
    num_code: "440",
    name: "LITHUANIA",
    display_name: "Lithuania"
  },
  {
    iso_2: "lu",
    iso_3: "lux",
    num_code: "442",
    name: "LUXEMBOURG",
    display_name: "Luxembourg"
  },
  {
    iso_2: "mo",
    iso_3: "mac",
    num_code: "446",
    name: "MACAO",
    display_name: "Macao"
  },
  {
    iso_2: "mk",
    iso_3: "mkd",
    num_code: "807",
    name: "MACEDONIA, THE FORMER YUGOSLAV REPUBLIC OF",
    display_name: "Macedonia, the Former Yugoslav Republic of"
  },
  {
    iso_2: "mg",
    iso_3: "mdg",
    num_code: "450",
    name: "MADAGASCAR",
    display_name: "Madagascar"
  },
  {
    iso_2: "mw",
    iso_3: "mwi",
    num_code: "454",
    name: "MALAWI",
    display_name: "Malawi"
  },
  {
    iso_2: "my",
    iso_3: "mys",
    num_code: "458",
    name: "MALAYSIA",
    display_name: "Malaysia"
  },
  {
    iso_2: "mv",
    iso_3: "mdv",
    num_code: "462",
    name: "MALDIVES",
    display_name: "Maldives"
  },
  {
    iso_2: "ml",
    iso_3: "mli",
    num_code: "466",
    name: "MALI",
    display_name: "Mali"
  },
  {
    iso_2: "mt",
    iso_3: "mlt",
    num_code: "470",
    name: "MALTA",
    display_name: "Malta"
  },
  {
    iso_2: "mh",
    iso_3: "mhl",
    num_code: "584",
    name: "MARSHALL ISLANDS",
    display_name: "Marshall Islands"
  },
  {
    iso_2: "mq",
    iso_3: "mtq",
    num_code: "474",
    name: "MARTINIQUE",
    display_name: "Martinique"
  },
  {
    iso_2: "mr",
    iso_3: "mrt",
    num_code: "478",
    name: "MAURITANIA",
    display_name: "Mauritania"
  },
  {
    iso_2: "mu",
    iso_3: "mus",
    num_code: "480",
    name: "MAURITIUS",
    display_name: "Mauritius"
  },
  {
    iso_2: "yt",
    iso_3: "myt",
    num_code: "175",
    name: "MAYOTTE",
    display_name: "Mayotte"
  },
  {
    iso_2: "mx",
    iso_3: "mex",
    num_code: "484",
    name: "MEXICO",
    display_name: "Mexico"
  },
  {
    iso_2: "fm",
    iso_3: "fsm",
    num_code: "583",
    name: "MICRONESIA, FEDERATED STATES OF",
    display_name: "Micronesia, Federated States of"
  },
  {
    iso_2: "md",
    iso_3: "mda",
    num_code: "498",
    name: "MOLDOVA, REPUBLIC OF",
    display_name: "Moldova, Republic of"
  },
  {
    iso_2: "mc",
    iso_3: "mco",
    num_code: "492",
    name: "MONACO",
    display_name: "Monaco"
  },
  {
    iso_2: "mn",
    iso_3: "mng",
    num_code: "496",
    name: "MONGOLIA",
    display_name: "Mongolia"
  },
  {
    iso_2: "me",
    iso_3: "mne",
    num_code: "499",
    name: "MONTENEGRO",
    display_name: "Montenegro"
  },
  {
    iso_2: "ms",
    iso_3: "msr",
    num_code: "500",
    name: "MONTSERRAT",
    display_name: "Montserrat"
  },
  {
    iso_2: "ma",
    iso_3: "mar",
    num_code: "504",
    name: "MOROCCO",
    display_name: "Morocco"
  },
  {
    iso_2: "mz",
    iso_3: "moz",
    num_code: "508",
    name: "MOZAMBIQUE",
    display_name: "Mozambique"
  },
  {
    iso_2: "mm",
    iso_3: "mmr",
    num_code: "104",
    name: "MYANMAR",
    display_name: "Myanmar"
  },
  {
    iso_2: "na",
    iso_3: "nam",
    num_code: "516",
    name: "NAMIBIA",
    display_name: "Namibia"
  },
  {
    iso_2: "nr",
    iso_3: "nru",
    num_code: "520",
    name: "NAURU",
    display_name: "Nauru"
  },
  {
    iso_2: "np",
    iso_3: "npl",
    num_code: "524",
    name: "NEPAL",
    display_name: "Nepal"
  },
  {
    iso_2: "nl",
    iso_3: "nld",
    num_code: "528",
    name: "NETHERLANDS",
    display_name: "Netherlands"
  },
  {
    iso_2: "nc",
    iso_3: "ncl",
    num_code: "540",
    name: "NEW CALEDONIA",
    display_name: "New Caledonia"
  },
  {
    iso_2: "nz",
    iso_3: "nzl",
    num_code: "554",
    name: "NEW ZEALAND",
    display_name: "New Zealand"
  },
  {
    iso_2: "ni",
    iso_3: "nic",
    num_code: "558",
    name: "NICARAGUA",
    display_name: "Nicaragua"
  },
  {
    iso_2: "ne",
    iso_3: "ner",
    num_code: "562",
    name: "NIGER",
    display_name: "Niger"
  },
  {
    iso_2: "ng",
    iso_3: "nga",
    num_code: "566",
    name: "NIGERIA",
    display_name: "Nigeria"
  },
  {
    iso_2: "nu",
    iso_3: "niu",
    num_code: "570",
    name: "NIUE",
    display_name: "Niue"
  },
  {
    iso_2: "nf",
    iso_3: "nfk",
    num_code: "574",
    name: "NORFOLK ISLAND",
    display_name: "Norfolk Island"
  },
  {
    iso_2: "mp",
    iso_3: "mnp",
    num_code: "580",
    name: "NORTHERN MARIANA ISLANDS",
    display_name: "Northern Mariana Islands"
  },
  {
    iso_2: "no",
    iso_3: "nor",
    num_code: "578",
    name: "NORWAY",
    display_name: "Norway"
  },
  {
    iso_2: "om",
    iso_3: "omn",
    num_code: "512",
    name: "OMAN",
    display_name: "Oman"
  },
  {
    iso_2: "pk",
    iso_3: "pak",
    num_code: "586",
    name: "PAKISTAN",
    display_name: "Pakistan"
  },
  {
    iso_2: "pw",
    iso_3: "plw",
    num_code: "585",
    name: "PALAU",
    display_name: "Palau"
  },
  {
    iso_2: "ps",
    iso_3: "pse",
    num_code: "275",
    name: "PALESTINIAN TERRITORY, OCCUPIED",
    display_name: "Palestinian Territory, Occupied"
  },
  {
    iso_2: "pa",
    iso_3: "pan",
    num_code: "591",
    name: "PANAMA",
    display_name: "Panama"
  },
  {
    iso_2: "pg",
    iso_3: "png",
    num_code: "598",
    name: "PAPUA NEW GUINEA",
    display_name: "Papua New Guinea"
  },
  {
    iso_2: "py",
    iso_3: "pry",
    num_code: "600",
    name: "PARAGUAY",
    display_name: "Paraguay"
  },
  {
    iso_2: "pe",
    iso_3: "per",
    num_code: "604",
    name: "PERU",
    display_name: "Peru"
  },
  {
    iso_2: "ph",
    iso_3: "phl",
    num_code: "608",
    name: "PHILIPPINES",
    display_name: "Philippines"
  },
  {
    iso_2: "pn",
    iso_3: "pcn",
    num_code: "612",
    name: "PITCAIRN",
    display_name: "Pitcairn"
  },
  {
    iso_2: "pl",
    iso_3: "pol",
    num_code: "616",
    name: "POLAND",
    display_name: "Poland"
  },
  {
    iso_2: "pt",
    iso_3: "prt",
    num_code: "620",
    name: "PORTUGAL",
    display_name: "Portugal"
  },
  {
    iso_2: "pr",
    iso_3: "pri",
    num_code: "630",
    name: "PUERTO RICO",
    display_name: "Puerto Rico"
  },
  {
    iso_2: "qa",
    iso_3: "qat",
    num_code: "634",
    name: "QATAR",
    display_name: "Qatar"
  },
  {
    iso_2: "re",
    iso_3: "reu",
    num_code: "638",
    name: "REUNION",
    display_name: "Reunion"
  },
  {
    iso_2: "ro",
    iso_3: "rom",
    num_code: "642",
    name: "ROMANIA",
    display_name: "Romania"
  },
  {
    iso_2: "ru",
    iso_3: "rus",
    num_code: "643",
    name: "RUSSIAN FEDERATION",
    display_name: "Russian Federation"
  },
  {
    iso_2: "rw",
    iso_3: "rwa",
    num_code: "646",
    name: "RWANDA",
    display_name: "Rwanda"
  },
  {
    iso_2: "bl",
    iso_3: "blm",
    num_code: "652",
    name: "SAINT BARTHÉLEMY",
    display_name: "Saint Barthélemy"
  },
  {
    iso_2: "sh",
    iso_3: "shn",
    num_code: "654",
    name: "SAINT HELENA",
    display_name: "Saint Helena"
  },
  {
    iso_2: "kn",
    iso_3: "kna",
    num_code: "659",
    name: "SAINT KITTS AND NEVIS",
    display_name: "Saint Kitts and Nevis"
  },
  {
    iso_2: "lc",
    iso_3: "lca",
    num_code: "662",
    name: "SAINT LUCIA",
    display_name: "Saint Lucia"
  },
  {
    iso_2: "mf",
    iso_3: "maf",
    num_code: "663",
    name: "SAINT MARTIN (FRENCH PART)",
    display_name: "Saint Martin (French part)"
  },
  {
    iso_2: "pm",
    iso_3: "spm",
    num_code: "666",
    name: "SAINT PIERRE AND MIQUELON",
    display_name: "Saint Pierre and Miquelon"
  },
  {
    iso_2: "vc",
    iso_3: "vct",
    num_code: "670",
    name: "SAINT VINCENT AND THE GRENADINES",
    display_name: "Saint Vincent and the Grenadines"
  },
  {
    iso_2: "ws",
    iso_3: "wsm",
    num_code: "882",
    name: "SAMOA",
    display_name: "Samoa"
  },
  {
    iso_2: "sm",
    iso_3: "smr",
    num_code: "674",
    name: "SAN MARINO",
    display_name: "San Marino"
  },
  {
    iso_2: "st",
    iso_3: "stp",
    num_code: "678",
    name: "SAO TOME AND PRINCIPE",
    display_name: "Sao Tome and Principe"
  },
  {
    iso_2: "sa",
    iso_3: "sau",
    num_code: "682",
    name: "SAUDI ARABIA",
    display_name: "Saudi Arabia"
  },
  {
    iso_2: "sn",
    iso_3: "sen",
    num_code: "686",
    name: "SENEGAL",
    display_name: "Senegal"
  },
  {
    iso_2: "rs",
    iso_3: "srb",
    num_code: "688",
    name: "SERBIA",
    display_name: "Serbia"
  },
  {
    iso_2: "sc",
    iso_3: "syc",
    num_code: "690",
    name: "SEYCHELLES",
    display_name: "Seychelles"
  },
  {
    iso_2: "sl",
    iso_3: "sle",
    num_code: "694",
    name: "SIERRA LEONE",
    display_name: "Sierra Leone"
  },
  {
    iso_2: "sg",
    iso_3: "sgp",
    num_code: "702",
    name: "SINGAPORE",
    display_name: "Singapore"
  },
  {
    iso_2: "sx",
    iso_3: "sxm",
    num_code: "534",
    name: "SINT MAARTEN",
    display_name: "Sint Maarten"
  },
  {
    iso_2: "sk",
    iso_3: "svk",
    num_code: "703",
    name: "SLOVAKIA",
    display_name: "Slovakia"
  },
  {
    iso_2: "si",
    iso_3: "svn",
    num_code: "705",
    name: "SLOVENIA",
    display_name: "Slovenia"
  },
  {
    iso_2: "sb",
    iso_3: "slb",
    num_code: "90",
    name: "SOLOMON ISLANDS",
    display_name: "Solomon Islands"
  },
  {
    iso_2: "so",
    iso_3: "som",
    num_code: "706",
    name: "SOMALIA",
    display_name: "Somalia"
  },
  {
    iso_2: "za",
    iso_3: "zaf",
    num_code: "710",
    name: "SOUTH AFRICA",
    display_name: "South Africa"
  },
  {
    iso_2: "gs",
    iso_3: "sgs",
    num_code: "239",
    name: "SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS",
    display_name: "South Georgia and the South Sandwich Islands"
  },
  {
    iso_2: "ss",
    iso_3: "ssd",
    num_code: "728",
    name: "SOUTH SUDAN",
    display_name: "South Sudan"
  },
  {
    iso_2: "es",
    iso_3: "esp",
    num_code: "724",
    name: "SPAIN",
    display_name: "Spain"
  },
  {
    iso_2: "lk",
    iso_3: "lka",
    num_code: "144",
    name: "SRI LANKA",
    display_name: "Sri Lanka"
  },
  {
    iso_2: "sd",
    iso_3: "sdn",
    num_code: "729",
    name: "SUDAN",
    display_name: "Sudan"
  },
  {
    iso_2: "sr",
    iso_3: "sur",
    num_code: "740",
    name: "SURINAME",
    display_name: "Suriname"
  },
  {
    iso_2: "sj",
    iso_3: "sjm",
    num_code: "744",
    name: "SVALBARD AND JAN MAYEN",
    display_name: "Svalbard and Jan Mayen"
  },
  {
    iso_2: "sz",
    iso_3: "swz",
    num_code: "748",
    name: "SWAZILAND",
    display_name: "Swaziland"
  },
  {
    iso_2: "se",
    iso_3: "swe",
    num_code: "752",
    name: "SWEDEN",
    display_name: "Sweden"
  },
  {
    iso_2: "ch",
    iso_3: "che",
    num_code: "756",
    name: "SWITZERLAND",
    display_name: "Switzerland"
  },
  {
    iso_2: "sy",
    iso_3: "syr",
    num_code: "760",
    name: "SYRIAN ARAB REPUBLIC",
    display_name: "Syrian Arab Republic"
  },
  {
    iso_2: "tw",
    iso_3: "twn",
    num_code: "158",
    name: "TAIWAN, PROVINCE OF CHINA",
    display_name: "Taiwan, Province of China"
  },
  {
    iso_2: "tj",
    iso_3: "tjk",
    num_code: "762",
    name: "TAJIKISTAN",
    display_name: "Tajikistan"
  },
  {
    iso_2: "tz",
    iso_3: "tza",
    num_code: "834",
    name: "TANZANIA, UNITED REPUBLIC OF",
    display_name: "Tanzania, United Republic of"
  },
  {
    iso_2: "th",
    iso_3: "tha",
    num_code: "764",
    name: "THAILAND",
    display_name: "Thailand"
  },
  {
    iso_2: "tl",
    iso_3: "tls",
    num_code: "626",
    name: "TIMOR LESTE",
    display_name: "Timor Leste"
  },
  {
    iso_2: "tg",
    iso_3: "tgo",
    num_code: "768",
    name: "TOGO",
    display_name: "Togo"
  },
  {
    iso_2: "tk",
    iso_3: "tkl",
    num_code: "772",
    name: "TOKELAU",
    display_name: "Tokelau"
  },
  {
    iso_2: "to",
    iso_3: "ton",
    num_code: "776",
    name: "TONGA",
    display_name: "Tonga"
  },
  {
    iso_2: "tt",
    iso_3: "tto",
    num_code: "780",
    name: "TRINIDAD AND TOBAGO",
    display_name: "Trinidad and Tobago"
  },
  {
    iso_2: "tn",
    iso_3: "tun",
    num_code: "788",
    name: "TUNISIA",
    display_name: "Tunisia"
  },
  {
    iso_2: "tr",
    iso_3: "tur",
    num_code: "792",
    name: "TURKEY",
    display_name: "Turkey"
  },
  {
    iso_2: "tm",
    iso_3: "tkm",
    num_code: "795",
    name: "TURKMENISTAN",
    display_name: "Turkmenistan"
  },
  {
    iso_2: "tc",
    iso_3: "tca",
    num_code: "796",
    name: "TURKS AND CAICOS ISLANDS",
    display_name: "Turks and Caicos Islands"
  },
  {
    iso_2: "tv",
    iso_3: "tuv",
    num_code: "798",
    name: "TUVALU",
    display_name: "Tuvalu"
  },
  {
    iso_2: "ug",
    iso_3: "uga",
    num_code: "800",
    name: "UGANDA",
    display_name: "Uganda"
  },
  {
    iso_2: "ua",
    iso_3: "ukr",
    num_code: "804",
    name: "UKRAINE",
    display_name: "Ukraine"
  },
  {
    iso_2: "ae",
    iso_3: "are",
    num_code: "784",
    name: "UNITED ARAB EMIRATES",
    display_name: "United Arab Emirates"
  },
  {
    iso_2: "gb",
    iso_3: "gbr",
    num_code: "826",
    name: "UNITED KINGDOM",
    display_name: "United Kingdom"
  },
  {
    iso_2: "us",
    iso_3: "usa",
    num_code: "840",
    name: "UNITED STATES",
    display_name: "United States"
  },
  {
    iso_2: "um",
    iso_3: "umi",
    num_code: "581",
    name: "UNITED STATES MINOR OUTLYING ISLANDS",
    display_name: "United States Minor Outlying Islands"
  },
  {
    iso_2: "uy",
    iso_3: "ury",
    num_code: "858",
    name: "URUGUAY",
    display_name: "Uruguay"
  },
  {
    iso_2: "uz",
    iso_3: "uzb",
    num_code: "860",
    name: "UZBEKISTAN",
    display_name: "Uzbekistan"
  },
  {
    iso_2: "vu",
    iso_3: "vut",
    num_code: "548",
    name: "VANUATU",
    display_name: "Vanuatu"
  },
  {
    iso_2: "ve",
    iso_3: "ven",
    num_code: "862",
    name: "VENEZUELA",
    display_name: "Venezuela"
  },
  {
    iso_2: "vn",
    iso_3: "vnm",
    num_code: "704",
    name: "VIET NAM",
    display_name: "Viet Nam"
  },
  {
    iso_2: "vg",
    iso_3: "vgb",
    num_code: "92",
    name: "VIRGIN ISLANDS, BRITISH",
    display_name: "Virgin Islands, British"
  },
  {
    iso_2: "vi",
    iso_3: "vir",
    num_code: "850",
    name: "VIRGIN ISLANDS, U.S.",
    display_name: "Virgin Islands, U.S."
  },
  {
    iso_2: "wf",
    iso_3: "wlf",
    num_code: "876",
    name: "WALLIS AND FUTUNA",
    display_name: "Wallis and Futuna"
  },
  {
    iso_2: "eh",
    iso_3: "esh",
    num_code: "732",
    name: "WESTERN SAHARA",
    display_name: "Western Sahara"
  },
  {
    iso_2: "ye",
    iso_3: "yem",
    num_code: "887",
    name: "YEMEN",
    display_name: "Yemen"
  },
  {
    iso_2: "zm",
    iso_3: "zmb",
    num_code: "894",
    name: "ZAMBIA",
    display_name: "Zambia"
  },
  {
    iso_2: "zw",
    iso_3: "zwe",
    num_code: "716",
    name: "ZIMBABWE",
    display_name: "Zimbabwe"
  },
  {
    iso_2: "ax",
    iso_3: "ala",
    num_code: "248",
    name: "ÅLAND ISLANDS",
    display_name: "Åland Islands"
  }
];
function isSameAddress(a, b) {
  if (!a || !b) {
    return false;
  }
  return a.first_name === b.first_name && a.last_name === b.last_name && a.address_1 === b.address_1 && a.address_2 === b.address_2 && a.city === b.city && a.postal_code === b.postal_code && a.province === b.province && a.country_code === b.country_code && a.phone === b.phone && a.company === b.company;
}
const englishCountryName = (_iso2, fallback) => fallback;
function getFormattedAddress(address, getCountryName = englishCountryName) {
  if (!address) {
    return [];
  }
  const {
    first_name,
    last_name,
    company,
    address_1,
    address_2,
    city,
    postal_code,
    province,
    country_code
  } = address;
  const country = "country" in address ? address.country : null;
  const name = [first_name, last_name].filter(Boolean).join(" ");
  const formattedAddress = [];
  if (name) {
    formattedAddress.push(name);
  }
  if (company) {
    formattedAddress.push(company);
  }
  if (address_1) {
    formattedAddress.push(address_1);
  }
  if (address_2) {
    formattedAddress.push(address_2);
  }
  const cityProvincePostal = [city, province, postal_code].filter(Boolean).join(" ");
  if (cityProvincePostal) {
    formattedAddress.push(cityProvincePostal);
  }
  if (country) {
    formattedAddress.push(
      country.iso_2 ? getCountryName(country.iso_2, country.display_name) : country.display_name
    );
  } else if (country_code) {
    const country2 = getCountryByIso2(country_code);
    if (country2) {
      formattedAddress.push(getCountryName(country2.iso_2, country2.display_name));
    } else {
      formattedAddress.push(country_code.toUpperCase());
    }
  }
  return formattedAddress;
}
const AddressCard = ({
  customerId,
  addressId,
  tag = "shipping",
  onRemove
}) => {
  const { t } = reactI18next.useTranslation();
  const { address, isPending, isError, error } = useCustomerAddress(
    customerId,
    addressId
  );
  if (isError) {
    throw error;
  }
  const isReady = !isPending && !!address;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-3 py-2 rounded-lg bg-ui-bg-component shadow-elevation-card-rest flex items-center gap-4", children: [
    !isReady ? /* @__PURE__ */ jsxRuntime.jsx(LoadingState$1, {}) : /* @__PURE__ */ jsxRuntime.jsx(AddressInfo, { address }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { size: "2xsmall", children: tag === "shipping" ? t("draftOrdersPlugin.addressCard.shipping") : t("draftOrdersPlugin.addressCard.billing") }),
    onRemove && /* @__PURE__ */ jsxRuntime.jsx(
      ui.IconButton,
      {
        className: "shrink-0",
        variant: "transparent",
        size: "small",
        onClick: onRemove,
        type: "button",
        children: /* @__PURE__ */ jsxRuntime.jsx(icons.XMark, {})
      }
    )
  ] });
};
const LoadingState$1 = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-0.5", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "w-20 h-5" }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "w-16 h-5" }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "w-16 h-5" })
  ] });
};
const AddressInfo = ({ address }) => {
  const getCountryName = useCountryName();
  const addressSegments = getFormattedAddress(address, getCountryName);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col flex-1", children: [
    address.address_name && /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: address.address_name }),
    addressSegments.map((segment, idx) => /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: "small", leading: "compact", className: "text-ui-fg-subtle", children: [
      segment,
      idx < addressSegments.length - 1 && ", "
    ] }))
  ] });
};
const CustomerCard = ({ customerId, onRemove }) => {
  const { customer, isPending, isError, error } = useCustomer(customerId);
  if (isError) {
    throw error;
  }
  const isReady = !isPending && !!customer;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-3 py-2 rounded-lg bg-ui-bg-component shadow-elevation-card-rest flex items-center gap-4", children: [
    !isReady ? /* @__PURE__ */ jsxRuntime.jsx(LoadingState, {}) : /* @__PURE__ */ jsxRuntime.jsx(CustomerInfo, { customer }),
    onRemove && /* @__PURE__ */ jsxRuntime.jsx(
      ui.IconButton,
      {
        className: "shrink-0",
        variant: "transparent",
        size: "small",
        onClick: onRemove,
        type: "button",
        children: /* @__PURE__ */ jsxRuntime.jsx(icons.XMark, {})
      }
    )
  ] });
};
const LoadingState = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-4", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "w-7 h-7 rounded-full" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "w-20 h-5" }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "w-16 h-5" })
    ] })
  ] });
};
const CustomerInfo = ({ customer }) => {
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ");
  const fallback = name ? name[0] : customer.email[0];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-4 flex-1", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Avatar, { size: "small", fallback, className: "w-6 h-6" }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col flex-1 overflow-hidden", children: [
      name && /* @__PURE__ */ jsxRuntime.jsx(
        ui.Text,
        {
          leading: "compact",
          size: "small",
          weight: "plus",
          className: "truncate",
          children: name
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Text,
        {
          leading: "compact",
          size: "small",
          className: "text-ui-fg-subtle truncate",
          children: customer.email
        }
      )
    ] })
  ] });
};
const Provider = reactHookForm.FormProvider;
const FormFieldContext = React.createContext(
  {}
);
const Field = ({
  ...props
}) => {
  return /* @__PURE__ */ jsxRuntime.jsx(FormFieldContext.Provider, { value: { name: props.name }, children: /* @__PURE__ */ jsxRuntime.jsx(reactHookForm.Controller, { ...props }) });
};
const FormItemContext = React.createContext(
  {}
);
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = reactHookForm.useFormContext();
  const formState = reactHookForm.useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within a FormField");
  }
  const { id } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formLabelId: `${id}-form-item-label`,
    formDescriptionId: `${id}-form-item-description`,
    formErrorMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
const Item$2 = React.forwardRef(
  ({ className, ...props }, ref) => {
    const id = React.useId();
    return /* @__PURE__ */ jsxRuntime.jsx(FormItemContext.Provider, { value: { id }, children: /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        ref,
        className: ui.clx("flex flex-col space-y-2", className),
        ...props
      }
    ) });
  }
);
Item$2.displayName = "Form.Item";
const Label = React.forwardRef(
  ({
    className,
    optional = false,
    tooltip,
    icon,
    variant = "default",
    ...props
  }, ref) => {
    const { t } = reactI18next.useTranslation();
    const { formLabelId, formItemId } = useFormField();
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Label,
        {
          id: formLabelId,
          ref,
          className: ui.clx(
            {
              "text-ui-fg-subtle": variant === "subtle"
            },
            className
          ),
          htmlFor: formItemId,
          size: "small",
          weight: variant === "default" ? "plus" : "regular",
          ...props
        }
      ),
      tooltip && /* @__PURE__ */ jsxRuntime.jsx(ui.Tooltip, { content: tooltip, children: /* @__PURE__ */ jsxRuntime.jsx(icons.InformationCircleSolid, { className: "text-ui-fg-muted" }) }),
      icon,
      optional && /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", className: "text-ui-fg-muted", children: t("draftOrdersPlugin.general.optional") })
    ] });
  }
);
Label.displayName = "Form.Label";
const Control = React.forwardRef(({ ...props }, ref) => {
  const {
    error,
    formItemId,
    formDescriptionId,
    formErrorMessageId,
    formLabelId
  } = useFormField();
  return /* @__PURE__ */ jsxRuntime.jsx(
    radixUi.Slot.Root,
    {
      ref,
      id: formItemId,
      "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formErrorMessageId}`,
      "aria-invalid": !!error,
      "aria-labelledby": formLabelId,
      ...props
    }
  );
});
Control.displayName = "Form.Control";
const Hint = React.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsxRuntime.jsx(
    ui.Hint,
    {
      ref,
      id: formDescriptionId,
      className,
      ...props
    }
  );
});
Hint.displayName = "Form.Hint";
const ErrorMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formErrorMessageId } = useFormField();
  const msg = error ? String(error?.message) : children;
  if (!msg || msg === "undefined") {
    return null;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    ui.Hint,
    {
      ref,
      id: formErrorMessageId,
      className,
      variant: error ? "error" : "info",
      ...props,
      children: msg
    }
  );
});
ErrorMessage.displayName = "Form.ErrorMessage";
const Form$2 = Object.assign(Provider, {
  Item: Item$2,
  Label,
  Control,
  Hint,
  ErrorMessage,
  Field
});
const KeyboundForm = React__default.default.forwardRef(({ onSubmit, onKeyDown, ...rest }, ref) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(event);
  };
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      if (event.target instanceof HTMLTextAreaElement && !(event.metaKey || event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      if (event.metaKey || event.ctrlKey) {
        handleSubmit(event);
      }
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    "form",
    {
      ...rest,
      onSubmit: handleSubmit,
      onKeyDown: onKeyDown ?? handleKeyDown,
      ref
    }
  );
});
KeyboundForm.displayName = "KeyboundForm";
function genericForwardRef(render) {
  return React.forwardRef(render);
}
const TABLUAR_NUM_WIDTH = 8;
const TAG_BASE_WIDTH = 28;
const ComboboxImpl = ({
  value: controlledValue,
  onChange,
  searchValue: controlledSearchValue,
  onSearchValueChange,
  options,
  className,
  placeholder,
  fetchNextPage,
  isFetchingNextPage,
  onCreateOption,
  noResultsPlaceholder,
  ...inputProps
}, ref) => {
  const { t } = reactI18next.useTranslation();
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const comboboxRef = React.useRef(null);
  const listboxRef = React.useRef(null);
  React.useImperativeHandle(ref, () => comboboxRef.current);
  const isValueControlled = controlledValue !== void 0;
  const isSearchControlled = controlledSearchValue !== void 0;
  const isArrayValue = Array.isArray(controlledValue);
  const emptyState = isArrayValue ? [] : "";
  const [uncontrolledSearchValue, setUncontrolledSearchValue] = React.useState(
    controlledSearchValue || ""
  );
  const defferedSearchValue = React.useDeferredValue(uncontrolledSearchValue);
  const [uncontrolledValue, setUncontrolledValue] = React.useState(emptyState);
  const searchValue = isSearchControlled ? controlledSearchValue : uncontrolledSearchValue;
  const selectedValues = isValueControlled ? controlledValue : uncontrolledValue;
  const handleValueChange = (newValues) => {
    const exists = options.filter((o) => !o.disabled).find((o) => {
      if (isArrayValue) {
        return newValues?.includes(o.value);
      }
      return o.value === newValues;
    });
    if (!exists && onCreateOption && newValues) {
      onCreateOption(newValues);
    }
    if (!isValueControlled) {
      setUncontrolledValue(newValues || emptyState);
    }
    if (onChange) {
      onChange(newValues);
    }
    setUncontrolledSearchValue("");
  };
  const handleSearchChange = (query2) => {
    setUncontrolledSearchValue(query2);
    if (onSearchValueChange) {
      onSearchValueChange(query2);
    }
  };
  const matches = React.useMemo(() => {
    if (isSearchControlled) {
      return [];
    }
    return matchSorter.matchSorter(options, defferedSearchValue, {
      keys: ["label"]
    });
  }, [options, defferedSearchValue, isSearchControlled]);
  const observer = React.useRef(
    new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          fetchNextPage?.();
        }
      },
      { threshold: 1 }
    )
  );
  const lastOptionRef = React.useCallback(
    (node) => {
      if (isFetchingNextPage) {
        return;
      }
      if (observer.current) {
        observer.current.disconnect();
      }
      if (node) {
        observer.current.observe(node);
      }
    },
    [isFetchingNextPage]
  );
  const handleOpenChange = (open2) => {
    if (!open2) {
      setUncontrolledSearchValue("");
    }
    setOpen(open2);
  };
  const hasValue = selectedValues?.length > 0;
  const showTag = hasValue && isArrayValue;
  const showSelected = showTag && !searchValue && !open;
  const hideInput = !isArrayValue && hasValue && !open;
  const selectedLabel = options.find((o) => o.value === selectedValues)?.label;
  const hidePlaceholder = hasValue || showSelected || open;
  const tagWidth = React.useMemo(() => {
    if (!Array.isArray(selectedValues)) {
      return TAG_BASE_WIDTH + TABLUAR_NUM_WIDTH;
    }
    const count = selectedValues.length;
    const digits = count.toString().length;
    return TAG_BASE_WIDTH + digits * TABLUAR_NUM_WIDTH;
  }, [selectedValues]);
  const results = React.useMemo(() => {
    return isSearchControlled ? options : matches;
  }, [matches, options, isSearchControlled]);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    react.ComboboxProvider,
    {
      open,
      setOpen: handleOpenChange,
      selectedValue: selectedValues,
      setSelectedValue: (value) => handleValueChange(value),
      value: uncontrolledSearchValue,
      setValue: (query2) => {
        startTransition(() => handleSearchChange(query2));
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(
          "div",
          {
            className: ui.clx(
              "relative flex cursor-pointer items-center gap-x-2 overflow-hidden",
              "h-8 w-full rounded-md",
              "bg-ui-bg-field transition-fg shadow-borders-base",
              "has-[input:focus]:shadow-borders-interactive-with-active",
              "has-[:invalid]:shadow-borders-error has-[[aria-invalid=true]]:shadow-borders-error",
              "has-[:disabled]:bg-ui-bg-disabled has-[:disabled]:text-ui-fg-disabled has-[:disabled]:cursor-not-allowed",
              className
            ),
            style: {
              "--tag-width": `${tagWidth}px`
            },
            children: [
              showTag && /* @__PURE__ */ jsxRuntime.jsxs(
                "button",
                {
                  type: "button",
                  onClick: (e) => {
                    e.preventDefault();
                    handleValueChange(void 0);
                  },
                  className: "bg-ui-bg-base hover:bg-ui-bg-base-hover txt-compact-small-plus text-ui-fg-subtle focus-within:border-ui-fg-interactive transition-fg absolute left-0.5 top-0.5 z-[1] flex h-[28px] items-center rounded-[4px] border py-[3px] pl-1.5 pr-1 outline-none",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "tabular-nums", children: selectedValues.length }),
                    /* @__PURE__ */ jsxRuntime.jsx(icons.XMarkMini, { className: "text-ui-fg-muted" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative flex size-full items-center", children: [
                showSelected && /* @__PURE__ */ jsxRuntime.jsx(
                  "div",
                  {
                    className: ui.clx(
                      "pointer-events-none absolute inset-y-0 flex size-full items-center",
                      {
                        "left-[calc(var(--tag-width)+8px)]": showTag,
                        "left-2": !showTag
                      }
                    ),
                    children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: t("draftOrdersPlugin.combobox.selected") })
                  }
                ),
                hideInput && /* @__PURE__ */ jsxRuntime.jsx(
                  "div",
                  {
                    className: ui.clx(
                      "pointer-events-none absolute inset-y-0 flex size-full items-center overflow-hidden pr-10",
                      {
                        "left-[calc(var(--tag-width)+8px)]": showTag,
                        "left-2": !showTag
                      }
                    ),
                    children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", className: "truncate", children: selectedLabel })
                  }
                ),
                /* @__PURE__ */ jsxRuntime.jsx(
                  react.Combobox,
                  {
                    autoSelect: true,
                    ref: comboboxRef,
                    onFocus: () => setOpen(true),
                    className: ui.clx(
                      "txt-compact-small text-ui-fg-base !placeholder:text-ui-fg-muted transition-fg size-full cursor-pointer bg-transparent pl-2 pr-8 outline-none focus:cursor-text",
                      "hover:bg-ui-bg-field-hover",
                      {
                        "pl-2": !showTag,
                        "pl-[calc(var(--tag-width)+8px)]": showTag,
                        "opacity-0": hideInput
                      }
                    ),
                    placeholder: hidePlaceholder ? void 0 : placeholder,
                    ...inputProps
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx(
                react.ComboboxDisclosure,
                {
                  "aria-label": open ? t("draftOrdersPlugin.combobox.hidePopup") : t("draftOrdersPlugin.combobox.showPopup"),
                  render: (props) => {
                    return /* @__PURE__ */ jsxRuntime.jsx(
                      "button",
                      {
                        ...props,
                        type: "button",
                        className: "text-ui-fg-muted transition-fg hover:bg-ui-bg-field-hover absolute right-0 flex size-8 items-center justify-center rounded-r outline-none",
                        children: /* @__PURE__ */ jsxRuntime.jsx(icons.TrianglesMini, {})
                      }
                    );
                  }
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsxs(
          react.ComboboxPopover,
          {
            gutter: 4,
            sameWidth: true,
            ref: listboxRef,
            role: "listbox",
            className: ui.clx(
              "shadow-elevation-flyout bg-ui-bg-base z-50 rounded-[8px] p-1",
              "max-h-[200px] overflow-y-auto",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            ),
            style: {
              pointerEvents: open ? "auto" : "none"
            },
            "aria-busy": isPending,
            children: [
              results.map(({ value, label, disabled }) => /* @__PURE__ */ jsxRuntime.jsxs(
                react.ComboboxItem,
                {
                  value,
                  focusOnHover: true,
                  setValueOnClick: false,
                  disabled,
                  className: ui.clx(
                    "transition-fg bg-ui-bg-base data-[active-item=true]:bg-ui-bg-base-hover group flex cursor-pointer items-center gap-x-2 rounded-[4px] px-2 py-1",
                    {
                      "text-ui-fg-disabled": disabled,
                      "bg-ui-bg-component": disabled
                    }
                  ),
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(react.ComboboxItemCheck, { className: "flex !size-5 items-center justify-center", children: isArrayValue ? /* @__PURE__ */ jsxRuntime.jsx(icons.CheckMini, {}) : /* @__PURE__ */ jsxRuntime.jsx(icons.EllipseMiniSolid, {}) }),
                    /* @__PURE__ */ jsxRuntime.jsx(react.ComboboxItemValue, { className: "txt-compact-small", children: label })
                  ]
                },
                value
              )),
              !!fetchNextPage && /* @__PURE__ */ jsxRuntime.jsx("div", { ref: lastOptionRef, className: "w-px" }),
              isFetchingNextPage && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "transition-fg bg-ui-bg-base flex items-center rounded-[4px] px-2 py-1.5", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-ui-bg-component size-full h-5 w-full animate-pulse rounded-[4px]" }) }),
              !results.length && (noResultsPlaceholder && !searchValue?.length ? noResultsPlaceholder : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center gap-x-2 rounded-[4px] px-2 py-1.5", children: /* @__PURE__ */ jsxRuntime.jsx(
                ui.Text,
                {
                  size: "small",
                  leading: "compact",
                  className: "text-ui-fg-subtle",
                  children: t("draftOrdersPlugin.combobox.noResults")
                }
              ) })),
              !results.length && onCreateOption && /* @__PURE__ */ jsxRuntime.jsxs(React.Fragment, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(react.Separator, { className: "bg-ui-border-base -mx-1" }),
                /* @__PURE__ */ jsxRuntime.jsxs(
                  react.ComboboxItem,
                  {
                    value: uncontrolledSearchValue,
                    focusOnHover: true,
                    setValueOnClick: false,
                    className: "transition-fg bg-ui-bg-base data-[active-item=true]:bg-ui-bg-base-hover group mt-1 flex cursor-pointer items-center gap-x-2 rounded-[4px] px-2 py-1.5",
                    children: [
                      /* @__PURE__ */ jsxRuntime.jsx(icons.PlusMini, { className: "text-ui-fg-subtle" }),
                      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: t("draftOrdersPlugin.combobox.create", { value: searchValue }) })
                    ]
                  }
                )
              ] })
            ]
          }
        )
      ]
    }
  );
};
const Combobox = genericForwardRef(ComboboxImpl);
const CountrySelect = React.forwardRef(
  ({ className, disabled, placeholder, value, defaultValue, ...props }, ref) => {
    const { t, i18n } = reactI18next.useTranslation();
    const getCountryName = useCountryName();
    const innerRef = React.useRef(null);
    React.useImperativeHandle(ref, () => innerRef.current);
    const isPlaceholder = innerRef.current?.value === "";
    const options = React.useMemo(() => {
      const named = countries.map((country) => ({
        iso_2: country.iso_2,
        name: getCountryName(country.iso_2, country.display_name)
      }));
      if (i18n.language === "en") {
        return named;
      }
      const collator = new Intl.Collator(toLocaleTag(i18n.language));
      return named.sort((a, b) => collator.compare(a.name, b.name));
    }, [getCountryName, i18n.language]);
    return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        icons.TrianglesMini,
        {
          className: ui.clx(
            "text-ui-fg-muted transition-fg pointer-events-none absolute right-2 top-1/2 -translate-y-1/2",
            {
              "text-ui-fg-disabled": disabled
            }
          )
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsxs(
        "select",
        {
          value: value !== void 0 ? value.toLowerCase() : void 0,
          defaultValue: defaultValue ? defaultValue.toLowerCase() : void 0,
          disabled,
          className: ui.clx(
            "bg-ui-bg-field shadow-buttons-neutral transition-fg txt-compact-small flex w-full select-none appearance-none items-center justify-between rounded-md px-2 py-1.5 outline-none",
            "placeholder:text-ui-fg-muted text-ui-fg-base",
            "hover:bg-ui-bg-field-hover",
            "focus-visible:shadow-borders-interactive-with-active data-[state=open]:!shadow-borders-interactive-with-active",
            "aria-[invalid=true]:border-ui-border-error aria-[invalid=true]:shadow-borders-error",
            "invalid::border-ui-border-error invalid:shadow-borders-error",
            "disabled:!bg-ui-bg-disabled disabled:!text-ui-fg-disabled",
            {
              "text-ui-fg-muted": isPlaceholder
            },
            className
          ),
          ...props,
          ref: innerRef,
          children: [
            /* @__PURE__ */ jsxRuntime.jsx("option", { value: "", disabled: true, className: "text-ui-fg-muted", children: placeholder || t("draftOrdersPlugin.fields.selectCountry") }),
            options.map((country) => {
              return /* @__PURE__ */ jsxRuntime.jsx("option", { value: country.iso_2.toLowerCase(), children: country.name }, country.iso_2);
            })
          ]
        }
      )
    ] });
  }
);
CountrySelect.displayName = "CountrySelect";
const RouteModalForm = ({
  form,
  blockSearchParams: blockSearch = false,
  children,
  onClose
}) => {
  const { t } = reactI18next.useTranslation();
  const {
    formState: { isDirty }
  } = form;
  const blocker = reactRouterDom.useBlocker(({ currentLocation, nextLocation }) => {
    const { isSubmitSuccessful } = nextLocation.state || {};
    if (isSubmitSuccessful) {
      onClose?.(true);
      return false;
    }
    const isPathChanged = currentLocation.pathname !== nextLocation.pathname;
    const isSearchChanged = currentLocation.search !== nextLocation.search;
    if (blockSearch) {
      const ret2 = isDirty && (isPathChanged || isSearchChanged);
      if (!ret2) {
        onClose?.(isSubmitSuccessful);
      }
      return ret2;
    }
    const ret = isDirty && isPathChanged;
    if (!ret) {
      onClose?.(isSubmitSuccessful);
    }
    return ret;
  });
  const handleCancel = () => {
    blocker?.reset?.();
  };
  const handleContinue = () => {
    blocker?.proceed?.();
    onClose?.(false);
  };
  return /* @__PURE__ */ jsxRuntime.jsxs(Form$2, { ...form, children: [
    children,
    /* @__PURE__ */ jsxRuntime.jsx(ui.Prompt, { open: blocker.state === "blocked", variant: "confirmation", children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Prompt.Content, { children: [
      /* @__PURE__ */ jsxRuntime.jsxs(ui.Prompt.Header, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Prompt.Title, { children: t("draftOrdersPlugin.unsavedChanges.title") }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Prompt.Description, { children: t("draftOrdersPlugin.unsavedChanges.description") })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.Prompt.Footer, { children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Prompt.Cancel, { onClick: handleCancel, type: "button", children: t("draftOrdersPlugin.general.cancel") }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Prompt.Action, { onClick: handleContinue, type: "button", children: t("draftOrdersPlugin.general.continue") })
      ] })
    ] }) })
  ] });
};
const RouteModalProviderContext = React.createContext(null);
const RouteModalProvider = ({
  prev,
  children
}) => {
  const navigate = reactRouterDom.useNavigate();
  const [closeOnEscape, setCloseOnEscape] = React.useState(true);
  const handleSuccess = React.useCallback(
    (path) => {
      const to = path || prev;
      navigate(to, { replace: true, state: { isSubmitSuccessful: true } });
    },
    [navigate, prev]
  );
  const value = React.useMemo(
    () => ({
      handleSuccess,
      setCloseOnEscape,
      __internal: { closeOnEscape }
    }),
    [handleSuccess, setCloseOnEscape, closeOnEscape]
  );
  return /* @__PURE__ */ jsxRuntime.jsx(RouteModalProviderContext.Provider, { value, children });
};
const StackedModalContext = React.createContext(null);
const StackedModalProvider = ({
  children,
  onOpenChange
}) => {
  const [state, setState] = React.useState({});
  const getIsOpen = (id) => {
    return state[id] || false;
  };
  const setIsOpen = (id, open) => {
    setState((prevState) => ({
      ...prevState,
      [id]: open
    }));
    onOpenChange(open);
  };
  const register = (id) => {
    setState((prevState) => ({
      ...prevState,
      [id]: false
    }));
  };
  const unregister = (id) => {
    setState((prevState) => {
      const newState = { ...prevState };
      delete newState[id];
      return newState;
    });
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    StackedModalContext.Provider,
    {
      value: {
        getIsOpen,
        setIsOpen,
        register,
        unregister
      },
      children
    }
  );
};
const useStackedModal = () => {
  const context = React.useContext(StackedModalContext);
  if (!context) {
    throw new Error(
      "useStackedModal must be used within a StackedModalProvider"
    );
  }
  return context;
};
const Root$3 = ({ prev = "..", onClose, children }) => {
  const navigate = reactRouterDom.useNavigate();
  const [open, setOpen] = React.useState(false);
  const [stackedModalOpen, onStackedModalOpen] = React.useState(false);
  React.useEffect(() => {
    setOpen(true);
    return () => {
      setOpen(false);
      onStackedModalOpen(false);
    };
  }, []);
  const handleOpenChange = async (open2) => {
    if (!open2) {
      if (onClose) {
        const ret = await onClose();
        if (!ret) {
          return;
        }
      }
      document.body.style.pointerEvents = "auto";
      navigate(prev, { replace: true });
      return;
    }
    setOpen(open2);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(ui.Drawer, { open, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsxRuntime.jsx(RouteModalProvider, { prev, children: /* @__PURE__ */ jsxRuntime.jsx(StackedModalProvider, { onOpenChange: onStackedModalOpen, children: /* @__PURE__ */ jsxRuntime.jsx(
    ui.Drawer.Content,
    {
      "aria-describedby": void 0,
      className: ui.clx({
        "!bg-ui-bg-disabled !inset-y-5 !right-5": stackedModalOpen
      }),
      children
    }
  ) }) }) });
};
const Header$4 = ui.Drawer.Header;
const Title$3 = ui.Drawer.Title;
const Description$3 = ui.Drawer.Description;
const Body$3 = ui.Drawer.Body;
const Footer$5 = ui.Drawer.Footer;
const Close$3 = ui.Drawer.Close;
const Form$1 = RouteModalForm;
const RouteDrawer = Object.assign(Root$3, {
  Header: Header$4,
  Title: Title$3,
  Body: Body$3,
  Description: Description$3,
  Footer: Footer$5,
  Close: Close$3,
  Form: Form$1
});
const useRouteModal = () => {
  const context = React.useContext(RouteModalProviderContext);
  if (!context) {
    throw new Error("useRouteModal must be used within a RouteModalProvider");
  }
  return context;
};
const Root$2 = ({ prev = "..", onClose, children }) => {
  const navigate = reactRouterDom.useNavigate();
  const [open, setOpen] = React.useState(false);
  const [stackedModalOpen, onStackedModalOpen] = React.useState(false);
  React.useEffect(() => {
    setOpen(true);
    return () => {
      setOpen(false);
      onStackedModalOpen(false);
    };
  }, []);
  const handleOpenChange = async (open2) => {
    if (!open2) {
      if (onClose) {
        const ret = await onClose();
        if (!ret) {
          return;
        }
      }
      document.body.style.pointerEvents = "auto";
      navigate(prev, { replace: true });
      return;
    }
    setOpen(open2);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal, { open, onOpenChange: handleOpenChange, children: /* @__PURE__ */ jsxRuntime.jsx(RouteModalProvider, { prev, children: /* @__PURE__ */ jsxRuntime.jsx(StackedModalProvider, { onOpenChange: onStackedModalOpen, children: /* @__PURE__ */ jsxRuntime.jsx(Content$2, { stackedModalOpen, children }) }) }) });
};
const Content$2 = ({ stackedModalOpen, children }) => {
  const { __internal } = useRouteModal();
  const shouldPreventClose = !__internal.closeOnEscape;
  return /* @__PURE__ */ jsxRuntime.jsx(
    ui.FocusModal.Content,
    {
      onEscapeKeyDown: shouldPreventClose ? (e) => {
        e.preventDefault();
      } : void 0,
      className: ui.clx({
        "!bg-ui-bg-disabled !inset-x-5 !inset-y-3": stackedModalOpen
      }),
      children
    }
  );
};
const Header$3 = ui.FocusModal.Header;
const Title$2 = ui.FocusModal.Title;
const Description$2 = ui.FocusModal.Description;
const Footer$4 = ui.FocusModal.Footer;
const Body$2 = ui.FocusModal.Body;
const Close$2 = ui.FocusModal.Close;
const Form = RouteModalForm;
const RouteFocusModal = Object.assign(Root$2, {
  Header: Header$3,
  Title: Title$2,
  Body: Body$2,
  Description: Description$2,
  Footer: Footer$4,
  Close: Close$2,
  Form
});
const Root$1 = ({ id, children }) => {
  const { register, unregister, getIsOpen, setIsOpen } = useStackedModal();
  React.useEffect(() => {
    register(id);
    return () => unregister(id);
  }, []);
  return /* @__PURE__ */ jsxRuntime.jsx(ui.Drawer, { open: getIsOpen(id), onOpenChange: (open) => setIsOpen(id, open), children });
};
const Close$1 = ui.Drawer.Close;
Close$1.displayName = "StackedDrawer.Close";
const Header$2 = ui.Drawer.Header;
Header$2.displayName = "StackedDrawer.Header";
const Body$1 = ui.Drawer.Body;
Body$1.displayName = "StackedDrawer.Body";
const Trigger$1 = ui.Drawer.Trigger;
Trigger$1.displayName = "StackedDrawer.Trigger";
const Footer$3 = ui.Drawer.Footer;
Footer$3.displayName = "StackedDrawer.Footer";
const Title$1 = ui.Drawer.Title;
Title$1.displayName = "StackedDrawer.Title";
const Description$1 = ui.Drawer.Description;
Description$1.displayName = "StackedDrawer.Description";
const Content$1 = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    ui.Drawer.Content,
    {
      ref,
      className: ui.clx(className),
      overlayProps: {
        className: "bg-transparent"
      },
      ...props
    }
  );
});
Content$1.displayName = "StackedDrawer.Content";
Object.assign(Root$1, {
  Close: Close$1,
  Header: Header$2,
  Body: Body$1,
  Content: Content$1,
  Trigger: Trigger$1,
  Footer: Footer$3,
  Description: Description$1,
  Title: Title$1
});
const Root = ({
  id,
  onOpenChangeCallback,
  children
}) => {
  const { register, unregister, getIsOpen, setIsOpen } = useStackedModal();
  React.useEffect(() => {
    register(id);
    return () => unregister(id);
  }, []);
  const handleOpenChange = (open) => {
    setIsOpen(id, open);
    onOpenChangeCallback?.(open);
  };
  return /* @__PURE__ */ jsxRuntime.jsx(ui.FocusModal, { open: getIsOpen(id), onOpenChange: handleOpenChange, children });
};
const Close = ui.FocusModal.Close;
Close.displayName = "StackedFocusModal.Close";
const Header$1 = ui.FocusModal.Header;
Header$1.displayName = "StackedFocusModal.Header";
const Body = ui.FocusModal.Body;
Body.displayName = "StackedFocusModal.Body";
const Trigger = ui.FocusModal.Trigger;
Trigger.displayName = "StackedFocusModal.Trigger";
const Footer$2 = ui.FocusModal.Footer;
Footer$2.displayName = "StackedFocusModal.Footer";
const Title = ui.FocusModal.Title;
Title.displayName = "StackedFocusModal.Title";
const Description = ui.FocusModal.Description;
Description.displayName = "StackedFocusModal.Description";
const Content = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    ui.FocusModal.Content,
    {
      ref,
      className: ui.clx("!top-6", className),
      overlayProps: {
        className: "bg-transparent"
      },
      ...props
    }
  );
});
Content.displayName = "StackedFocusModal.Content";
const StackedFocusModal = Object.assign(Root, {
  Close,
  Header: Header$1,
  Body,
  Content,
  Trigger,
  Footer: Footer$2,
  Description,
  Title
});
const useDebouncedSearch = () => {
  const [searchValue, onSearchValueChange] = React.useState("");
  const [debouncedQuery, setDebouncedQuery] = React.useState("");
  const debouncedUpdate = React.useCallback(
    debounce__default.default((query2) => setDebouncedQuery(query2), 300),
    []
  );
  React.useEffect(() => {
    debouncedUpdate(searchValue);
    return () => debouncedUpdate.cancel();
  }, [searchValue, debouncedUpdate]);
  return {
    searchValue,
    onSearchValueChange,
    query: debouncedQuery
  };
};
const useComboboxData = ({
  queryKey,
  queryFn,
  getOptions,
  defaultValue,
  defaultValueKey,
  pageSize = 10,
  enabled = true
}) => {
  const { searchValue, onSearchValueChange, query: query2 } = useDebouncedSearch();
  const queryInitialDataBy = defaultValueKey || "id";
  const { data: initialData } = reactQuery.useQuery({
    queryKey,
    queryFn: async () => {
      return queryFn({
        [queryInitialDataBy]: defaultValue,
        limit: Array.isArray(defaultValue) ? defaultValue.length : 1
      });
    },
    enabled: !!defaultValue
  });
  const { data, ...rest } = reactQuery.useInfiniteQuery({
    queryKey: [...queryKey, query2],
    queryFn: async ({ pageParam = 0 }) => {
      return await queryFn({
        q: query2,
        limit: pageSize,
        offset: pageParam
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const moreItemsExist = lastPage.count > lastPage.offset + lastPage.limit;
      return moreItemsExist ? lastPage.offset + lastPage.limit : void 0;
    },
    placeholderData: reactQuery.keepPreviousData,
    enabled
  });
  const options = data?.pages.flatMap((page) => getOptions(page)) ?? [];
  const defaultOptions = initialData ? getOptions(initialData) : [];
  const disabled = !rest.isPending && !options.length && !searchValue;
  if (defaultValue && defaultOptions.length && !searchValue) {
    defaultOptions.forEach((option) => {
      if (!options.find((o) => o.value === option.value)) {
        options.unshift(option);
      }
    });
  }
  return {
    options,
    searchValue,
    onSearchValueChange,
    disabled,
    ...rest
  };
};
function getParsedType(data) {
  if (typeof data === "number") {
    return Number.isNaN(data) ? "NaN" : "number";
  }
  if (typeof data === "object") {
    if (Array.isArray(data)) {
      return "array";
    }
    if (data === null) {
      return "null";
    }
    if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
      return data.constructor.name;
    }
  }
  return typeof data;
}
function stringifyPrimitive(value) {
  if (typeof value === "bigint") {
    return value.toString() + "n";
  }
  if (typeof value === "string") {
    return `"${value}"`;
  }
  return `${value}`;
}
const useZodErrorMap = () => {
  const { t } = reactI18next.useTranslation();
  return React.useCallback(
    (issue) => {
      switch (issue.code) {
        case "custom": {
          const key = issue.params?.i18nKey;
          return typeof key === "string" ? t(key) : void 0;
        }
        case "invalid_type": {
          const missing = issue.input === void 0 || issue.input === null;
          return t(
            missing ? "draftOrdersPlugin.validation.required" : "draftOrdersPlugin.validation.invalidType",
            {
              expected: issue.expected,
              received: getParsedType(issue.input)
            }
          );
        }
        case "too_small": {
          if (issue.origin !== "string") {
            return void 0;
          }
          const minimum = Number(issue.minimum);
          const comparison = issue.inclusive ? ">=" : ">";
          const count = issue.inclusive ? minimum : minimum + 1;
          return t(
            count <= 1 ? "draftOrdersPlugin.validation.requiredText" : "draftOrdersPlugin.validation.tooShort",
            { comparison, minimum: issue.minimum.toString(), length: count }
          );
        }
        case "invalid_format":
          return issue.format === "email" ? t("draftOrdersPlugin.validation.invalidEmail") : void 0;
        case "invalid_value":
          return issue.values.length === 1 ? t("draftOrdersPlugin.validation.invalidValue", {
            value: stringifyPrimitive(issue.values[0])
          }) : t("draftOrdersPlugin.validation.invalidOption", {
            values: issue.values.map(stringifyPrimitive).join("|")
          });
        case "invalid_union":
          return t("draftOrdersPlugin.validation.invalidInput");
        default:
          return void 0;
      }
    },
    [t]
  );
};
const addressSchema = zod.z.object({
  country_code: zod.z.string().min(1),
  first_name: zod.z.string().min(1),
  last_name: zod.z.string().min(1),
  address_1: zod.z.string().min(1),
  address_2: zod.z.string().nullish(),
  company: zod.z.string().nullish(),
  city: zod.z.string().min(1),
  province: zod.z.string().nullish(),
  postal_code: zod.z.string().min(1),
  phone: zod.z.string().nullish()
});
const Create = () => {
  return /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal, { children: /* @__PURE__ */ jsxRuntime.jsx(CreateForm, {}) });
};
const CreateForm = () => {
  const { t } = reactI18next.useTranslation();
  const zodErrorMap = useZodErrorMap();
  const { handleSuccess } = useRouteModal();
  const form = reactHookForm.useForm({
    defaultValues: {
      region_id: "",
      sales_channel_id: "",
      customer_id: "",
      email: "",
      shipping_address_id: "",
      shipping_address: initialAddress,
      billing_address_id: "",
      billing_address: null,
      same_as_shipping: true
    },
    resolver: zod$1.zodResolver(schema$6, { error: zodErrorMap })
  });
  const regions = useComboboxData({
    queryFn: async (params) => {
      return await sdk.admin.region.list(params);
    },
    queryKey: ["regions"],
    getOptions: (data) => {
      return data.regions.map((region) => ({
        label: region.name,
        value: region.id
      }));
    }
  });
  const salesChannels = useComboboxData({
    queryFn: async (params) => {
      return await sdk.admin.salesChannel.list(params);
    },
    queryKey: ["sales-channels"],
    getOptions: (data) => {
      return data.sales_channels.map((salesChannel) => ({
        label: salesChannel.name,
        value: salesChannel.id
      }));
    }
  });
  const { mutateAsync } = useCreateDraftOrder();
  const onSubmit = form.handleSubmit(async (data) => {
    const billingAddress = data.same_as_shipping ? data.shipping_address : data.billing_address;
    await mutateAsync(
      {
        region_id: data.region_id,
        sales_channel_id: data.sales_channel_id,
        customer_id: data.customer_id || void 0,
        email: !data.customer_id ? data.email || void 0 : void 0,
        shipping_address: data.shipping_address,
        billing_address: billingAddress
      },
      {
        onSuccess: (response) => {
          handleSuccess(`/draft-orders/${response.draft_order.id}`);
        },
        onError: (error) => {
          ui.toast.error(error.message);
        }
      }
    );
  });
  if (regions.isError) {
    throw regions.error;
  }
  if (salesChannels.isError) {
    throw salesChannels.error;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Form, { form, children: /* @__PURE__ */ jsxRuntime.jsxs(
    KeyboundForm,
    {
      className: "flex h-full flex-col overflow-hidden",
      onSubmit,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Header, {}),
        /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Body, { className: "flex flex-1 flex-col overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-1 flex-col items-center overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full max-w-[720px] flex-col gap-y-6 px-2 py-16", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.create.title") }) }),
            /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.create.description") }) })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "region_id",
              render: ({ field }) => {
                return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-x-3", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.region") }),
                    /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.create.regionHint") })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
                      Combobox,
                      {
                        options: regions.options,
                        fetchNextPage: regions.fetchNextPage,
                        isFetchingNextPage: regions.isFetchingNextPage,
                        searchValue: regions.searchValue,
                        onSearchValueChange: regions.onSearchValueChange,
                        placeholder: t("draftOrdersPlugin.create.regionPlaceholder"),
                        ...field,
                        autoComplete: "off"
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                  ] })
                ] }) });
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "sales_channel_id",
              render: ({ field }) => {
                return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-x-3", children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.salesChannel") }),
                    /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.create.salesChannelHint") })
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
                      Combobox,
                      {
                        options: salesChannels.options,
                        fetchNextPage: salesChannels.fetchNextPage,
                        isFetchingNextPage: salesChannels.isFetchingNextPage,
                        searchValue: salesChannels.searchValue,
                        onSearchValueChange: salesChannels.onSearchValueChange,
                        placeholder: t("draftOrdersPlugin.salesChannel.placeholder"),
                        ...field
                      }
                    ) }),
                    /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                  ] })
                ] }) });
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
          /* @__PURE__ */ jsxRuntime.jsx(CustomerField$1, { control: form.control, setValue: form.setValue }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
          /* @__PURE__ */ jsxRuntime.jsx(EmailField, { control: form.control }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            AddressField,
            {
              type: "shipping_address",
              control: form.control,
              setValue: form.setValue
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            AddressField,
            {
              type: "billing_address",
              control: form.control,
              setValue: form.setValue
            }
          )
        ] }) }) }),
        /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-end gap-x-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "secondary", size: "small", children: t("draftOrdersPlugin.general.cancel") }) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", children: t("draftOrdersPlugin.general.save") })
        ] }) })
      ]
    }
  ) });
};
const EmailField = ({ control }) => {
  const { t } = reactI18next.useTranslation();
  const customerId = reactHookForm.useWatch({ control, name: "customer_id" });
  return /* @__PURE__ */ jsxRuntime.jsx(
    Form$2.Field,
    {
      control,
      name: "email",
      render: ({ field }) => {
        return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-x-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.email") }),
            /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.create.emailHint") })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ConditionalTooltip,
            {
              content: t("draftOrdersPlugin.create.emailDisabled"),
              showTooltip: !!customerId,
              children: /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
                  ui.Input,
                  {
                    ...field,
                    placeholder: t("draftOrdersPlugin.create.emailPlaceholder"),
                    disabled: field.disabled || !!customerId
                  }
                ) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          )
        ] }) });
      }
    }
  );
};
const CustomerField$1 = ({ control, setValue }) => {
  const { t } = reactI18next.useTranslation();
  const email = reactHookForm.useWatch({ control, name: "email" });
  const customerId = reactHookForm.useWatch({ control, name: "customer_id" });
  const customers = useComboboxData({
    queryFn: async (params) => {
      return await sdk.admin.customer.list(params);
    },
    queryKey: ["customers"],
    getOptions: (data) => {
      return data.customers.map((customer) => {
        const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ");
        return {
          label: name ? `${name} (${customer.email})` : customer.email,
          value: customer.id
        };
      });
    }
  });
  const onPropagateEmail = React.useCallback(
    (value) => {
      const label = customers.options.find(
        (option) => option.value === value
      )?.label;
      const customerEmail = label?.match(/\((.*@.*)\)$/)?.[1] || label;
      setValue("email", customerEmail || "", {
        shouldDirty: true,
        shouldTouch: true
      });
    },
    [email, setValue, customers.options]
  );
  if (customers.isError) {
    throw customers.error;
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    Form$2.Field,
    {
      control,
      name: "customer_id",
      render: ({ field: { onChange, ...field } }) => {
        const onRemove = () => {
          onChange("");
          setValue("shipping_address_id", "");
        };
        return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-x-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, children: t("draftOrdersPlugin.fields.customer") }),
            /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.create.customerHint") })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: customerId ? /* @__PURE__ */ jsxRuntime.jsx(CustomerCard, { customerId, onRemove }) : /* @__PURE__ */ jsxRuntime.jsx(
              Combobox,
              {
                options: customers.options,
                fetchNextPage: customers.fetchNextPage,
                isFetchingNextPage: customers.isFetchingNextPage,
                searchValue: customers.searchValue,
                onSearchValueChange: customers.onSearchValueChange,
                placeholder: t("draftOrdersPlugin.create.customerPlaceholder"),
                onChange: (value) => {
                  onPropagateEmail(value);
                  onChange(value);
                },
                ...field
              }
            ) }),
            /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
          ] })
        ] }) });
      }
    }
  );
};
const AddressField = ({ type, control, setValue }) => {
  const { t } = reactI18next.useTranslation();
  const getCountryName = useCountryName();
  const customerId = reactHookForm.useWatch({ control, name: "customer_id" });
  const addressId = reactHookForm.useWatch({ control, name: `${type}_id` });
  const sameAsShipping = reactHookForm.useWatch({ control, name: "same_as_shipping" });
  const { customer } = useCustomer(
    customerId,
    {},
    {
      enabled: !!customerId
    }
  );
  const addresses = useComboboxData({
    queryFn: async (params) => {
      const response = await sdk.client.fetch(
        "/admin/customers/" + customerId + "/addresses",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          query: params,
          credentials: "include"
        }
      );
      return response;
    },
    queryKey: [type, customerId],
    getOptions: (data) => {
      return data.addresses.map((address) => {
        const formattedAddress = getFormattedAddress(
          address,
          getCountryName
        ).join(",\n");
        return {
          label: formattedAddress,
          value: address.id
        };
      });
    },
    enabled: !!customerId
  });
  const onSelectAddress = async (addressId2) => {
    if (!addressId2 || !customerId) {
      return;
    }
    const response = await sdk.client.fetch(
      "/admin/customers/" + customerId + "/addresses/" + addressId2,
      {
        method: "GET",
        credentials: "include"
      }
    );
    const address = response.address;
    setValue(type, {
      ...address,
      first_name: address.first_name || customer?.first_name,
      last_name: address.last_name || customer?.last_name
    });
  };
  const showFields = type === "billing_address" ? !sameAsShipping : true;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-x-3", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-1", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { size: "small", weight: "plus", children: type === "shipping_address" ? t("draftOrdersPlugin.create.shippingAddress") : t("draftOrdersPlugin.create.billingAddress") }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Hint, { children: type === "shipping_address" ? t("draftOrdersPlugin.create.shippingAddressHint") : t("draftOrdersPlugin.create.billingAddressHint") })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-3", children: [
      type === "billing_address" && /* @__PURE__ */ jsxRuntime.jsx(
        Form$2.Field,
        {
          control,
          name: "same_as_shipping",
          render: ({ field: { value, onChange, ...field } }) => {
            const onCheckedChange = (checked) => {
              if (!checked) {
                setValue("billing_address", initialAddress);
              } else {
                setValue("billing_address_id", "");
                setValue("billing_address", null);
              }
              onChange(checked);
            };
            return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-[28px_1fr] items-start gap-3", children: [
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
                ui.Switch,
                {
                  size: "small",
                  ...field,
                  checked: value,
                  onCheckedChange
                }
              ) }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.create.sameAsShipping") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.create.sameAsShippingHint") })
              ] })
            ] }) });
          }
        }
      ),
      showFields && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-3", children: [
        customerId && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control,
              name: `${type}_id`,
              render: ({ field: { onChange, ...field } }) => {
                const onRemove = () => {
                  onChange("");
                };
                return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: addressId ? /* @__PURE__ */ jsxRuntime.jsx(
                  AddressCard,
                  {
                    customerId,
                    addressId,
                    tag: type === "shipping_address" ? "shipping" : "billing",
                    onRemove
                  }
                ) : /* @__PURE__ */ jsxRuntime.jsxs(React.Fragment, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, variant: "subtle", children: t("draftOrdersPlugin.create.savedAddresses") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.create.savedAddressesHint") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
                    Combobox,
                    {
                      options: addresses.options,
                      fetchNextPage: addresses.fetchNextPage,
                      isFetchingNextPage: addresses.isFetchingNextPage,
                      searchValue: addresses.searchValue,
                      onSearchValueChange: addresses.onSearchValueChange,
                      placeholder: type === "shipping_address" ? t(
                        "draftOrdersPlugin.create.selectShippingAddress"
                      ) : t(
                        "draftOrdersPlugin.create.selectBillingAddress"
                      ),
                      onChange: (value) => {
                        onSelectAddress(value);
                        onChange(value);
                      },
                      ...field
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] }) });
              }
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" })
        ] }),
        !addressId && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control,
              name: `${type}.country_code`,
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { variant: "subtle", children: t("draftOrdersPlugin.fields.country") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(CountrySelect, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Form$2.Field,
              {
                control,
                name: `${type}.first_name`,
                render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { variant: "subtle", children: t("draftOrdersPlugin.fields.firstName") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Form$2.Field,
              {
                control,
                name: `${type}.last_name`,
                render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { variant: "subtle", children: t("draftOrdersPlugin.fields.lastName") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control,
              name: `${type}.company`,
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, variant: "subtle", children: t("draftOrdersPlugin.fields.company") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control,
              name: `${type}.address_1`,
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { variant: "subtle", children: t("draftOrdersPlugin.fields.address") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control,
              name: `${type}.address_2`,
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, variant: "subtle", children: t("draftOrdersPlugin.fields.address2") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Form$2.Field,
              {
                control,
                name: `${type}.postal_code`,
                render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { variant: "subtle", children: t("draftOrdersPlugin.fields.postalCode") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Form$2.Field,
              {
                control,
                name: `${type}.city`,
                render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { variant: "subtle", children: t("draftOrdersPlugin.fields.city") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control,
              name: `${type}.province`,
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, variant: "subtle", children: t("draftOrdersPlugin.fields.province") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control,
              name: `${type}.phone`,
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, variant: "subtle", children: t("draftOrdersPlugin.fields.phone") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          )
        ] })
      ] })
    ] })
  ] });
};
const initialAddress = {
  country_code: "",
  first_name: "",
  last_name: "",
  address_1: "",
  address_2: "",
  city: "",
  province: "",
  postal_code: "",
  phone: "",
  company: ""
};
const schema$6 = zod.z.object({
  region_id: zod.z.string().min(1),
  sales_channel_id: zod.z.string().min(1),
  customer_id: zod.z.string().optional(),
  // The field defaults to an empty string, so we allow it here and let the
  // refinement below surface the "customer or email is required" message
  // instead of a confusing "Invalid email address".
  email: zod.z.union([zod.z.literal(""), zod.z.string().email()]).optional(),
  shipping_address_id: zod.z.string().optional(),
  shipping_address: addressSchema,
  billing_address_id: zod.z.string().optional(),
  billing_address: addressSchema.nullable(),
  same_as_shipping: zod.z.boolean().default(true)
}).superRefine((data, ctx) => {
  if (!data.customer_id && !data.email) {
    ctx.addIssue({
      code: zod.z.ZodIssueCode.custom,
      params: { i18nKey: "draftOrdersPlugin.create.customerOrEmailRequired" },
      path: ["email"]
    });
  }
  if (!data.shipping_address && !data.shipping_address_id) {
    ctx.addIssue({
      code: zod.z.ZodIssueCode.custom,
      params: { i18nKey: "draftOrdersPlugin.create.shippingAddressRequired" },
      path: ["shipping_address"]
    });
  }
  if (data.same_as_shipping === false) {
    if (!data.billing_address && !data.billing_address_id) {
      ctx.addIssue({
        code: zod.z.ZodIssueCode.custom,
        params: { i18nKey: "draftOrdersPlugin.create.billingAddressRequired" },
        path: ["billing_address"]
      });
    }
  }
});
const PageSkeleton = ({
  mainSections = 2,
  sidebarSections = 1,
  showJSON = false,
  showMetadata = true
}) => {
  const showExtraData = showJSON || showMetadata;
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-y-3", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-x-4 gap-y-3 xl:flex-row xl:items-start", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full flex-col gap-y-3", children: [
      Array.from({ length: mainSections }, (_, i) => i).map((section) => {
        return /* @__PURE__ */ jsxRuntime.jsx(
          ui.Skeleton,
          {
            className: ui.clx("h-full max-h-[460px] w-full rounded-lg", {
              "max-h-[219px]": section === 0
            })
          },
          section
        );
      }),
      showExtraData && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "hidden flex-col gap-y-3 xl:flex", children: [
        showMetadata && /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "h-[60px] w-full rounded-lg" }),
        showJSON && /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "h-[60px] w-full rounded-lg" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full max-w-[100%] flex-col gap-y-3 xl:mt-0 xl:max-w-[440px]", children: [
      Array.from({ length: sidebarSections }, (_, i) => i).map(
        (section) => {
          return /* @__PURE__ */ jsxRuntime.jsx(
            ui.Skeleton,
            {
              className: ui.clx("h-full max-h-[320px] w-full rounded-lg", {
                "max-h-[140px]": section === 0
              })
            },
            section
          );
        }
      ),
      showExtraData && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-3 xl:hidden", children: [
        showMetadata && /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "h-[60px] w-full rounded-lg" }),
        showJSON && /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "h-[60px] w-full rounded-lg" })
      ] })
    ] })
  ] }) });
};
const DETAILS_PAGE_REGEX = /\/draft-orders\/[a-zA-Z0-9_-]+\/?$/;
const ActiveOrderChange = ({ orderId }) => {
  const { t } = reactI18next.useTranslation();
  const { order: preview } = useOrderPreview(orderId);
  const location = reactRouterDom.useLocation();
  const isPending = preview?.order_change?.status === "pending";
  const isDetailsPage = DETAILS_PAGE_REGEX.test(location.pathname);
  const { mutateAsync, isPending: isMutating } = useDraftOrderCancelEdit(orderId);
  if (!isPending || !isDetailsPage) {
    return null;
  }
  const onCancel = async () => {
    await mutateAsync(void 0, {
      onError: (e) => {
        ui.toast.error(e.message);
      },
      onSuccess: () => {
        ui.toast.success(t("draftOrdersPlugin.activeEdit.cancelled"));
      }
    });
  };
  const actions = preview.order_change.actions;
  const noActions = !actions || actions.length === 0;
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: "border-b border-x px-3 py-3 -mx-4 -mt-3",
      style: {
        background: "repeating-linear-gradient(-45deg, rgb(212, 212, 216, 0.15), rgb(212, 212, 216,.15) 10px, transparent 10px, transparent 20px)"
      },
      children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "p-0 overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-4 flex items-center gap-x-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(icons.ExclamationCircleSolid, { className: "text-ui-fg-interactive" }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.activeEdit.title") })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { className: "text-pretty", children: noActions ? t("draftOrdersPlugin.activeEdit.noChanges") : t("draftOrdersPlugin.activeEdit.withChanges") }) }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-component px-6 py-4 justify-end items-center flex gap-x-2", children: [
          !noActions && /* @__PURE__ */ jsxRuntime.jsx(
            ui.Button,
            {
              size: "small",
              variant: "secondary",
              isLoading: isMutating,
              onClick: onCancel,
              children: t("draftOrdersPlugin.general.continue")
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Button,
            {
              size: "small",
              variant: "secondary",
              isLoading: isMutating,
              onClick: onCancel,
              children: t("draftOrdersPlugin.general.cancel")
            }
          )
        ] })
      ] })
    }
  );
};
const USER_QUERY_KEY = "users";
const usersQueryKeys = {
  list: (query2) => [
    USER_QUERY_KEY,
    query2 ? query2 : void 0
  ],
  detail: (id, query2) => [
    USER_QUERY_KEY,
    id,
    query2 ? query2 : void 0
  ]
};
const useUser = (id, query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryKey: usersQueryKeys.detail(id, query2),
    queryFn: async () => sdk.admin.user.retrieve(id, query2),
    ...options
  });
  return { ...data, ...rest };
};
const ActivitySection = ({ order, changes }) => {
  const { t } = reactI18next.useTranslation();
  const tp = usePlural();
  const activityItems = React.useMemo(
    () => getActivityItems(order, changes, t, tp),
    [order, changes, t, tp]
  );
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "overflow-hidden p-0", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.activity.title") }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ActivityItemList, { items: activityItems })
  ] });
};
const ActivityItemList = ({ items }) => {
  if (items.length <= 3) {
    return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-y-0.5 px-6 pb-6", children: items.map((item, idx) => /* @__PURE__ */ jsxRuntime.jsx(
      ActivityItem,
      {
        item,
        isFirst: idx === items.length - 1
      },
      idx
    )) });
  }
  const lastItems = items.slice(0, 2);
  const collapsibleItems = items.slice(2, items.length - 1);
  const firstItem = items[items.length - 1];
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-0.5 px-6 pb-6", children: [
    lastItems.map((item, idx) => /* @__PURE__ */ jsxRuntime.jsx(ActivityItem, { item }, idx)),
    /* @__PURE__ */ jsxRuntime.jsx(CollapsibleActivityItemList, { items: collapsibleItems }),
    /* @__PURE__ */ jsxRuntime.jsx(ActivityItem, { item: firstItem, isFirst: true }, items.length - 1)
  ] });
};
const CollapsibleActivityItemList = ({
  items
}) => {
  const tp = usePlural();
  const [open, setOpen] = React.useState(false);
  return /* @__PURE__ */ jsxRuntime.jsxs(radixUi.Collapsible.Root, { open, onOpenChange: setOpen, children: [
    !open && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-[20px_1fr] items-start gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex size-full flex-col items-center", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "border-ui-border-strong w-px flex-1 bg-[linear-gradient(var(--border-strong)_33%,rgba(255,255,255,0)_0%)] bg-[length:1px_3px] bg-clip-content bg-right bg-repeat-y" }) }),
      /* @__PURE__ */ jsxRuntime.jsx(radixUi.Collapsible.Trigger, { className: "text-ui-fg-muted hover:text-ui-fg-base focus:text-ui-fg-base m-0 p-0 pb-4 text-left outline-none transition-colors", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", weight: "plus", children: tp("draftOrdersPlugin.activity.showMore", items.length) }) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(radixUi.Collapsible.Content, { children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-y-0.5", children: items.map((item, idx) => {
      return /* @__PURE__ */ jsxRuntime.jsx(ActivityItem, { item }, idx);
    }) }) })
  ] });
};
const ActivityItem = ({ item, isFirst = false }) => {
  const { t } = reactI18next.useTranslation();
  const { getFullDate: getFullDate2, getRelativeDate: getRelativeDate2 } = useDate();
  const { user, isPending, isError, error } = useUser(item.userId, void 0, {
    enabled: !!item.userId
  });
  if (isError) {
    throw error;
  }
  const isUserLoaded = !isPending && !!user && !!item.userId;
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: ui.clx("grid w-full grid-cols-[20px_1fr] items-start gap-x-2"),
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex h-full flex-col items-center gap-0.5", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex size-5 items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "shadow-borders-base flex size-2.5 items-center justify-center rounded-full", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-ui-tag-neutral-icon size-1.5 rounded-full" }) }) }),
          !isFirst && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-1 items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-ui-border-base h-full w-px" }) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: ui.clx("flex flex-col", !isFirst && "pb-4"), children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between gap-x-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: item.label }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Tooltip,
              {
                content: getFullDate2({ date: item.timestamp, includeTime: true }),
                children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", className: "cursor-default", children: getRelativeDate2(item.timestamp) })
              }
            )
          ] }),
          item.content && renderContent(item.content),
          item.userId && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-ui-fg-muted pt-2", children: isUserLoaded ? /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Link, { to: `/settings/users/${user.id}`, className: "w-fit", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-fit items-center gap-x-1.5", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: t("draftOrdersPlugin.activity.by") }),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Avatar,
              {
                size: "2xsmall",
                fallback: [user.first_name, user.last_name].filter(Boolean).join("").slice(0, 1)
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: "small", children: [
              user.first_name,
              " ",
              user.last_name
            ] })
          ] }) }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-1.5", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", children: t("draftOrdersPlugin.activity.by") }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "h-5 w-5 rounded-full" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "h-4 w-[75px]" })
          ] }) })
        ] })
      ]
    }
  );
};
function renderContent(content) {
  if (typeof content === "string") {
    return /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: content });
  }
  return content;
}
const ACTIVITY_KEYS = {
  items: {
    count: "draftOrdersPlugin.activity.counts.items",
    added: "draftOrdersPlugin.activity.labels.itemsAdded",
    removed: "draftOrdersPlugin.activity.labels.itemsRemoved",
    updated: "draftOrdersPlugin.activity.labels.itemsUpdated"
  },
  shipping: {
    count: "draftOrdersPlugin.activity.counts.shippingMethods",
    added: "draftOrdersPlugin.activity.labels.shippingMethodsAdded",
    removed: "draftOrdersPlugin.activity.labels.shippingMethodsRemoved",
    updated: "draftOrdersPlugin.activity.labels.shippingMethodsUpdated"
  },
  promotions: {
    count: "draftOrdersPlugin.activity.counts.promotions",
    added: "draftOrdersPlugin.activity.labels.promotionsAdded",
    removed: "draftOrdersPlugin.activity.labels.promotionsRemoved",
    updated: "draftOrdersPlugin.activity.labels.promotionsUpdated"
  }
};
function getEditActivityItems(change, t, tp) {
  const activityItems = [];
  const counts = {
    itemsAdded: 0,
    itemsRemoved: 0,
    shippingMethodsAdded: 0,
    shippingMethodsRemoved: 0,
    promotionsAdded: 0,
    promotionsRemoved: 0
  };
  const orderedActions = change.actions.sort((a, b) => {
    return a.ordering - b.ordering;
  });
  const addedPromotionMap = /* @__PURE__ */ new Map();
  const removedPromotionMap = /* @__PURE__ */ new Map();
  for (const action of orderedActions) {
    if (!action.details) {
      continue;
    }
    switch (action.action) {
      case "ITEM_ADD":
        counts.itemsAdded += action.details.quantity;
        break;
      case "ITEM_UPDATE":
        const diff = action.details.quantity_diff;
        diff > 0 ? counts.itemsAdded += diff : counts.itemsRemoved += diff;
        break;
      case "SHIPPING_ADD":
        counts.shippingMethodsAdded += 1;
        break;
      case "SHIPPING_REMOVE":
        counts.shippingMethodsRemoved += 1;
        break;
      case "PROMOTION_ADD": {
        addedPromotionMap.set(action.reference_id, true);
        break;
      }
      case "PROMOTION_REMOVE": {
        if (addedPromotionMap.has(action.reference_id)) {
          addedPromotionMap.delete(action.reference_id);
        } else {
          removedPromotionMap.set(action.reference_id, true);
        }
        break;
      }
    }
    counts.promotionsAdded = addedPromotionMap.size;
    counts.promotionsRemoved = removedPromotionMap.size;
  }
  const createActivityItem = (type, added, removed) => {
    if (added === 0 && removed === 0) return;
    const keys = ACTIVITY_KEYS[type];
    const addedText = tp(keys.count, added);
    const removedText = tp(keys.count, Math.abs(removed));
    const content = added && removed ? t("draftOrdersPlugin.activity.addedAndRemoved", {
      added: addedText,
      removed: removedText
    }) : added ? t("draftOrdersPlugin.activity.added", { added: addedText }) : t("draftOrdersPlugin.activity.removed", { removed: removedText });
    const label = added && removed ? t(keys.updated) : added ? t(keys.added) : t(keys.removed);
    activityItems.push({
      label,
      content,
      timestamp: new Date(change.created_at).toISOString(),
      userId: change.confirmed_by
    });
  };
  createActivityItem("items", counts.itemsAdded, counts.itemsRemoved);
  createActivityItem(
    "shipping",
    counts.shippingMethodsAdded,
    counts.shippingMethodsRemoved
  );
  createActivityItem(
    "promotions",
    counts.promotionsAdded,
    counts.promotionsRemoved
  );
  return activityItems;
}
function getTransferActivityItem(change, t) {
  return {
    label: t("draftOrdersPlugin.activity.labels.transferred"),
    content: t("draftOrdersPlugin.activity.content.transferred"),
    timestamp: new Date(change.created_at).toISOString()
  };
}
function getUpdateOrderActivityItem(change, t) {
  const { details } = change.actions?.[0] || {};
  if (!details) {
    return null;
  }
  switch (details.type) {
    case "customer_id":
      return {
        label: t("draftOrdersPlugin.activity.labels.customerUpdated"),
        timestamp: new Date(change.created_at).toISOString(),
        userId: change.confirmed_by
      };
    case "sales_channel_id":
      return {
        label: t("draftOrdersPlugin.activity.labels.salesChannelUpdated"),
        timestamp: new Date(change.created_at).toISOString(),
        userId: change.confirmed_by
      };
    case "billing_address":
      return {
        label: t("draftOrdersPlugin.activity.labels.billingAddressUpdated"),
        timestamp: new Date(change.created_at).toISOString(),
        userId: change.confirmed_by
      };
    case "shipping_address":
      return {
        label: t("draftOrdersPlugin.activity.labels.shippingAddressUpdated"),
        timestamp: new Date(change.created_at).toISOString(),
        userId: change.confirmed_by
      };
    case "email":
      return {
        label: t("draftOrdersPlugin.activity.labels.emailUpdated"),
        timestamp: new Date(change.created_at).toISOString(),
        userId: change.confirmed_by
      };
    default:
      return null;
  }
}
function getActivityItems(order, changes, t, tp) {
  const items = [];
  if (order.created_at) {
    items.push({
      label: t("draftOrdersPlugin.activity.labels.created"),
      content: t("draftOrdersPlugin.activity.content.created"),
      timestamp: new Date(order.created_at).toISOString()
    });
  }
  changes.forEach((change) => {
    if (!change.change_type || !change.confirmed_at) {
      return;
    }
    switch (change.change_type) {
      case "edit": {
        items.push(...getEditActivityItems(change, t, tp));
        break;
      }
      case "transfer":
        items.push(getTransferActivityItem(change, t));
        break;
      case "update_order": {
        const item = getUpdateOrderActivityItem(change, t);
        if (item) {
          items.push(item);
        }
        break;
      }
    }
  });
  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
function getUniqueShippingProfiles(items) {
  const profiles = /* @__PURE__ */ new Map();
  items.forEach((item) => {
    const profile = item.variant?.product?.shipping_profile;
    if (profile) {
      profiles.set(profile.id, profile);
    }
  });
  return Array.from(profiles.values());
}
function getItemsWithShippingProfile(shipping_profile_id, items) {
  return items.filter(
    (item) => item.variant?.product?.shipping_profile?.id === shipping_profile_id
  );
}
function getOrderCustomer(obj) {
  const { first_name: sFirstName, last_name: sLastName } = obj.shipping_address || {};
  const { first_name: bFirstName, last_name: bLastName } = obj.billing_address || {};
  const { first_name: cFirstName, last_name: cLastName } = obj.customer || {};
  const customerName = [cFirstName, cLastName].filter(Boolean).join(" ");
  const shippingName = [sFirstName, sLastName].filter(Boolean).join(" ");
  const billingName = [bFirstName, bLastName].filter(Boolean).join(" ");
  const name = customerName || shippingName || billingName;
  return name;
}
const CustomerSection = ({ order }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "p-0 divide-y", children: [
    /* @__PURE__ */ jsxRuntime.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntime.jsx(ID$1, { order }),
    /* @__PURE__ */ jsxRuntime.jsx(Contact, { order }),
    /* @__PURE__ */ jsxRuntime.jsx(Addresses, { order })
  ] });
};
const Header = () => {
  const { t } = reactI18next.useTranslation();
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between px-6 py-4 gap-2", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: t("draftOrdersPlugin.customer.title") }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ActionMenu,
      {
        groups: [
          {
            actions: [
              {
                label: t("draftOrdersPlugin.customer.transferOwnership"),
                to: "transfer-ownership",
                icon: /* @__PURE__ */ jsxRuntime.jsx(icons.ArrowPath, {})
              }
            ]
          },
          {
            actions: [
              {
                label: t("draftOrdersPlugin.customer.editShippingAddress"),
                to: "shipping-address",
                icon: /* @__PURE__ */ jsxRuntime.jsx(icons.FlyingBox, {})
              },
              {
                label: t("draftOrdersPlugin.customer.editBillingAddress"),
                to: "billing-address",
                icon: /* @__PURE__ */ jsxRuntime.jsx(icons.CurrencyDollar, {})
              }
            ]
          },
          {
            actions: [
              {
                label: t("draftOrdersPlugin.customer.editEmail"),
                to: `email`,
                icon: /* @__PURE__ */ jsxRuntime.jsx(icons.Envelope, {})
              }
            ]
          }
        ]
      }
    )
  ] });
};
const ID$1 = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  const id = order.customer_id;
  const name = getOrderCustomer(order);
  const email = order.email;
  const fallback = (name || email || "").charAt(0).toUpperCase();
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", weight: "plus", children: t("draftOrdersPlugin.customer.id") }),
    /* @__PURE__ */ jsxRuntime.jsx(
      reactRouterDom.Link,
      {
        to: `/customers/${id}`,
        className: "focus:shadow-borders-focus rounded-[4px] outline-none transition-shadow",
        children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Avatar, { size: "2xsmall", fallback }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(
            ui.Text,
            {
              size: "small",
              leading: "compact",
              className: "text-ui-fg-subtle hover:text-ui-fg-base transition-fg truncate",
              children: name || email
            }
          ) })
        ] })
      }
    )
  ] });
};
const Contact = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  const phone = order.shipping_address?.phone || order.billing_address?.phone;
  const email = order.email || "";
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", weight: "plus", children: t("draftOrdersPlugin.customer.contact") }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-2", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-[1fr_20px] items-start gap-x-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Text,
          {
            size: "small",
            leading: "compact",
            className: "text-pretty break-all",
            children: email
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Copy, { content: email, className: "text-ui-fg-muted" }) })
      ] }),
      phone && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-[1fr_20px] items-start gap-x-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Text,
          {
            size: "small",
            leading: "compact",
            className: "text-pretty break-all",
            children: phone
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Copy, { content: phone, className: "text-ui-fg-muted" }) })
      ] })
    ] })
  ] });
};
const AddressPrint = ({
  address,
  type
}) => {
  const { t } = reactI18next.useTranslation();
  const getCountryName = useCountryName();
  const lines = getFormattedAddress(address, getCountryName);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-ui-fg-subtle grid grid-cols-2 items-start px-6 py-4", children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", weight: "plus", children: type === "shipping" ? t("draftOrdersPlugin.customer.shippingAddress") : t("draftOrdersPlugin.customer.billingAddress") }),
    address ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-[1fr_20px] items-start gap-x-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: lines.map((line, i) => {
        return /* @__PURE__ */ jsxRuntime.jsxs("span", { className: "break-words", children: [
          line,
          /* @__PURE__ */ jsxRuntime.jsx("br", {})
        ] }, i);
      }) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntime.jsx(
        ui.Copy,
        {
          content: lines.join("\n"),
          className: "text-ui-fg-muted"
        }
      ) })
    ] }) : /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: "-" })
  ] });
};
const Addresses = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "divide-y", children: [
    /* @__PURE__ */ jsxRuntime.jsx(AddressPrint, { address: order.shipping_address, type: "shipping" }),
    !isSameAddress(order.shipping_address, order.billing_address) ? /* @__PURE__ */ jsxRuntime.jsx(AddressPrint, { address: order.billing_address, type: "billing" }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 items-center px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Text,
        {
          size: "small",
          leading: "compact",
          weight: "plus",
          className: "text-ui-fg-subtle",
          children: t("draftOrdersPlugin.customer.billingAddress")
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", className: "text-ui-fg-muted", children: t("draftOrdersPlugin.customer.sameAsShipping") })
    ] })
  ] });
};
const GeneralSection = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  const { getFullDate: getFullDate2 } = useDate();
  const navigate = reactRouterDom.useNavigate();
  const { mutateAsync: deleteDraftOrder, isPending: isDeleting } = useDeleteDraftOrder();
  const { region, isPending, isError, error } = useRegion(
    order.region_id,
    void 0,
    {
      enabled: !!order.region_id
    }
  );
  const isRegionLoaded = !!region && !isPending;
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.detail.title", {
          displayId: order.display_id
        }) }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Copy, { content: `#${order.display_id}` }),
        isRegionLoaded ? /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { size: "2xsmall", rounded: "full", asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Link, { to: `/settings/regions/${region?.id}`, children: region?.name }) }) : /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "w-14 h-5 rounded-full" })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: t("draftOrdersPlugin.detail.createdFrom", {
        date: getFullDate2({
          date: order.created_at,
          includeTime: true
        }),
        salesChannel: order.sales_channel?.name
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ActionMenu,
      {
        groups: [
          {
            actions: [
              {
                label: t("draftOrdersPlugin.detail.editSalesChannel"),
                icon: /* @__PURE__ */ jsxRuntime.jsx(icons.Channels, {}),
                to: "sales-channel"
              },
              {
                label: t("draftOrdersPlugin.detail.delete"),
                icon: /* @__PURE__ */ jsxRuntime.jsx(icons.Trash, {}),
                onClick: async () => {
                  try {
                    await deleteDraftOrder(order.id);
                    navigate("/draft-orders");
                  } catch (error2) {
                    ui.toast.error(error2.message);
                  }
                },
                disabled: isDeleting
              }
            ]
          }
        ]
      }
    )
  ] });
};
const JsonViewSection = ({ data }) => {
  const { t } = reactI18next.useTranslation();
  const tp = usePlural();
  const numberOfKeys = Object.keys(data).length;
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex items-center justify-between px-6 py-4", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: "JSON" }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { size: "2xsmall", rounded: "full", children: tp("draftOrdersPlugin.json.keys", numberOfKeys) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(ui.Drawer, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Drawer.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
        ui.IconButton,
        {
          size: "small",
          variant: "transparent",
          className: "text-ui-fg-muted hover:text-ui-fg-subtle",
          children: /* @__PURE__ */ jsxRuntime.jsx(icons.ArrowUpRightOnBox, {})
        }
      ) }),
      /* @__PURE__ */ jsxRuntime.jsxs(ui.Drawer.Content, { className: "bg-ui-contrast-bg-base text-ui-code-fg-subtle !shadow-elevation-commandbar overflow-hidden border border-none max-md:inset-x-2 max-md:max-w-[calc(100%-16px)]", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-code-bg-base flex items-center justify-between px-6 py-4", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Drawer.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Heading, { className: "text-ui-contrast-fg-primary", children: [
              "JSON",
              " ",
              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-ui-fg-subtle", children: numberOfKeys }, "count-span")
            ] }) }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Drawer.Description, { className: "sr-only", children: t("draftOrdersPlugin.json.description") })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ui.Kbd, { className: "bg-ui-contrast-bg-subtle border-ui-contrast-border-base text-ui-contrast-fg-secondary", children: "esc" }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Drawer.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
              ui.IconButton,
              {
                size: "small",
                variant: "transparent",
                className: "text-ui-contrast-fg-secondary hover:text-ui-contrast-fg-primary hover:bg-ui-contrast-bg-base-hover active:bg-ui-contrast-bg-base-pressed focus-visible:bg-ui-contrast-bg-base-hover focus-visible:shadow-borders-interactive-with-active",
                children: /* @__PURE__ */ jsxRuntime.jsx(icons.XMarkMini, {})
              }
            ) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Drawer.Body, { className: "flex flex-1 flex-col overflow-hidden px-[5px] py-0 pb-[5px]", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-ui-contrast-bg-subtle flex-1 overflow-auto rounded-b-[4px] rounded-t-lg p-3", children: /* @__PURE__ */ jsxRuntime.jsx(
          React.Suspense,
          {
            fallback: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex size-full flex-col" }),
            children: /* @__PURE__ */ jsxRuntime.jsxs(
              Primitive__default.default,
              {
                value: data,
                displayDataTypes: false,
                style: {
                  "--w-rjv-font-family": "Roboto Mono, monospace",
                  "--w-rjv-line-color": "var(--contrast-border-base)",
                  "--w-rjv-curlybraces-color": "var(--contrast-fg-secondary)",
                  "--w-rjv-brackets-color": "var(--contrast-fg-secondary)",
                  "--w-rjv-key-string": "var(--contrast-fg-primary)",
                  "--w-rjv-info-color": "var(--contrast-fg-secondary)",
                  "--w-rjv-type-string-color": "var(--tag-green-icon)",
                  "--w-rjv-quotes-string-color": "var(--tag-green-icon)",
                  "--w-rjv-type-boolean-color": "var(--tag-orange-icon)",
                  "--w-rjv-type-int-color": "var(--tag-orange-icon)",
                  "--w-rjv-type-float-color": "var(--tag-orange-icon)",
                  "--w-rjv-type-bigint-color": "var(--tag-orange-icon)",
                  "--w-rjv-key-number": "var(--contrast-fg-secondary)",
                  "--w-rjv-arrow-color": "var(--contrast-fg-secondary)",
                  "--w-rjv-copied-color": "var(--contrast-fg-secondary)",
                  "--w-rjv-copied-success-color": "var(--contrast-fg-primary)",
                  "--w-rjv-colon-color": "var(--contrast-fg-primary)",
                  "--w-rjv-ellipsis-color": "var(--contrast-fg-secondary)"
                },
                collapsed: 1,
                children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Primitive__default.default.Quote, { render: () => /* @__PURE__ */ jsxRuntime.jsx("span", {}) }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    Primitive__default.default.Null,
                    {
                      render: () => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-ui-tag-red-icon", children: "null" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    Primitive__default.default.Undefined,
                    {
                      render: () => /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-ui-tag-blue-icon", children: "undefined" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    Primitive__default.default.CountInfo,
                    {
                      render: (_props, { value }) => {
                        return /* @__PURE__ */ jsxRuntime.jsx("span", { className: "text-ui-contrast-fg-secondary ml-2", children: tp(
                          "draftOrdersPlugin.json.keys",
                          Object.keys(value).length
                        ) });
                      }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntime.jsx(Primitive__default.default.Arrow, { children: /* @__PURE__ */ jsxRuntime.jsx(icons.TriangleDownMini, { className: "text-ui-contrast-fg-secondary -ml-[0.5px]" }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Primitive__default.default.Colon, { children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "mr-1", children: ":" }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(
                    Primitive__default.default.Copied,
                    {
                      render: ({ style }, { value }) => {
                        return /* @__PURE__ */ jsxRuntime.jsx(Copied, { style, value });
                      }
                    }
                  )
                ]
              }
            )
          }
        ) }) })
      ] })
    ] })
  ] });
};
const Copied = ({ style, value }) => {
  const [copied, setCopied] = React.useState(false);
  const handler = (e) => {
    e.stopPropagation();
    setCopied(true);
    if (typeof value === "string") {
      navigator.clipboard.writeText(value);
    } else {
      const json = JSON.stringify(value, null, 2);
      navigator.clipboard.writeText(json);
    }
    setTimeout(() => {
      setCopied(false);
    }, 2e3);
  };
  const styl = { whiteSpace: "nowrap", width: "20px" };
  if (copied) {
    return /* @__PURE__ */ jsxRuntime.jsx("span", { style: { ...style, ...styl }, children: /* @__PURE__ */ jsxRuntime.jsx(icons.Check, { className: "text-ui-contrast-fg-primary" }) });
  }
  return /* @__PURE__ */ jsxRuntime.jsx("span", { style: { ...style, ...styl }, onClick: handler, children: /* @__PURE__ */ jsxRuntime.jsx(icons.SquareTwoStack, { className: "text-ui-contrast-fg-secondary" }) });
};
const MetadataSection = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  const tp = usePlural();
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "flex items-center justify-between", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { level: "h2", children: t("draftOrdersPlugin.metadata.title") }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Badge, { size: "2xsmall", rounded: "full", children: tp(
        "draftOrdersPlugin.metadata.keys",
        Object.keys(order.metadata || {}).length
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ui.IconButton,
      {
        variant: "transparent",
        size: "small",
        className: "text-ui-fg-muted hover:text-ui-fg-subtle",
        asChild: true,
        children: /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Link, { to: "metadata", children: /* @__PURE__ */ jsxRuntime.jsx(icons.ArrowUpRightOnBox, {}) })
      }
    )
  ] });
};
const Thumbnail = ({ thumbnail, alt = "" }) => {
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "relative w-6 h-8 rounded overflow-hidden flex items-center justify-center bg-ui-bg-component", children: thumbnail ? /* @__PURE__ */ jsxRuntime.jsx(
    "img",
    {
      src: thumbnail,
      className: "w-full h-full object-cover",
      alt: alt ?? void 0
    }
  ) : /* @__PURE__ */ jsxRuntime.jsx(icons.Photo, {}) });
};
const ShippingSection = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  const orderHasShipping = order.shipping_methods.length > 0;
  const {
    shipping_options = [],
    isPending,
    isError,
    error
  } = useShippingOptions(
    {
      id: order.shipping_methods.map((method) => method.shipping_option_id).filter(Boolean),
      fields: "+service_zone.*,+service_zone.fulfillment_set.*,+service_zone.fulfillment_set.location.*,shipping_profile.*"
    },
    {
      enabled: orderHasShipping
    }
  );
  if (isError) {
    throw error;
  }
  const ready = !orderHasShipping ? true : shipping_options && !isPending;
  const data = React.useMemo(() => {
    const shippingProfilesData = getShippingProfileData(order.items);
    const profileIdMap = /* @__PURE__ */ new Map();
    shippingProfilesData.forEach((profile) => {
      profileIdMap.set(profile.id, true);
    });
    const uniqueProfilesOfShippingMethods = Array.from(
      new Set(shipping_options.map((option) => option.shipping_profile_id))
    );
    const additionalShippingProfilesData = uniqueProfilesOfShippingMethods.filter((id) => !profileIdMap.has(id)).map((id) => ({
      id,
      name: shipping_options.find((option) => option.shipping_profile_id === id)?.shipping_profile?.name || "",
      items: []
    }));
    const shippingProfileDisplayData = [
      ...shippingProfilesData,
      ...additionalShippingProfilesData
    ];
    return shippingProfileDisplayData.sort(
      (a, b) => a.name.localeCompare(b.name)
    );
  }, [order.items, shipping_options]);
  const isSomeProfilesAssigned = data.some(
    (profile) => shipping_options?.find(
      (option) => option.shipping_profile_id === profile.id
    )
  );
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "p-0 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.shippingSection.title") }) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
    /* @__PURE__ */ jsxRuntime.jsx(radixUi.Accordion.Root, { type: "multiple", children: ready && data.map((profile, idx) => /* @__PURE__ */ jsxRuntime.jsx("div", { children: renderShippingProfile(
      profile,
      shipping_options,
      idx === data.length - 1
    ) }, profile.id)) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
    /* @__PURE__ */ jsxRuntime.jsx(Footer$1, { isSomeProfilesAssigned })
  ] });
};
function renderShippingProfile(profile, shippingOptions, isLast) {
  const shippingOption = shippingOptions.find(
    (option) => option.shipping_profile_id === profile.id
  );
  if (shippingOption) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      ProfileWithShipping,
      {
        profile,
        shippingOption,
        isLast
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsx(ProfileWithoutShipping, { profile, isLast });
}
const ProfileWithShipping = ({
  profile,
  shippingOption,
  isLast
}) => {
  const tp = usePlural();
  const hasItems = profile.items.length > 0;
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(radixUi.Accordion.Item, { value: profile.id, children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center px-6 py-4 justify-between gap-x-3", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-3 max-sm:items-start", children: [
        /* @__PURE__ */ jsxRuntime.jsx(radixUi.Accordion.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
          ui.IconButton,
          {
            size: "2xsmall",
            variant: "transparent",
            className: "group/trigger",
            disabled: !hasItems,
            children: /* @__PURE__ */ jsxRuntime.jsx(icons.TriangleRightMini, { className: "group-data-[state=open]/trigger:rotate-90 transition-transform" })
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-[5px] max-sm:flex-col max-sm:items-start flex-1 w-full overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Tooltip,
            {
              content: /* @__PURE__ */ jsxRuntime.jsx("ul", { children: profile.items.map((item) => /* @__PURE__ */ jsxRuntime.jsx(
                "li",
                {
                  children: `${item.quantity}x ${item.variant?.product?.title} (${item.variant?.title})`
                },
                item.id
              )) }),
              children: /* @__PURE__ */ jsxRuntime.jsxs(
                ui.Badge,
                {
                  className: "flex items-center gap-x-[3px] overflow-hidden cursor-default",
                  size: "xsmall",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(icons.Shopping, { className: "shrink-0" }),
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: tp(
                      "draftOrdersPlugin.shippingSection.quantityBadge",
                      profile.items.length,
                      {
                        quantity: profile.items.reduce(
                          (acc, item) => acc + item.quantity,
                          0
                        )
                      }
                    ) })
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Tooltip,
            {
              content: shippingOption.service_zone?.fulfillment_set?.location?.name,
              children: /* @__PURE__ */ jsxRuntime.jsxs(
                ui.Badge,
                {
                  className: "flex items-center gap-x-[3px] overflow-hidden cursor-default",
                  size: "xsmall",
                  children: [
                    /* @__PURE__ */ jsxRuntime.jsx(icons.Buildings, { className: "shrink-0" }),
                    /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: shippingOption.service_zone?.fulfillment_set?.location?.name })
                  ]
                }
              )
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Tooltip, { content: shippingOption.name, children: /* @__PURE__ */ jsxRuntime.jsxs(
            ui.Badge,
            {
              className: "flex items-center gap-x-[3px] overflow-hidden cursor-default",
              size: "xsmall",
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(icons.TruckFast, { className: "shrink-0" }),
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: shippingOption.name })
              ]
            }
          ) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsx(ShippingProfileItems, { profile })
    ] }),
    !isLast && /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" })
  ] });
};
const ProfileWithoutShipping = ({
  profile,
  isLast
}) => {
  const { t } = reactI18next.useTranslation();
  const tp = usePlural();
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(radixUi.Accordion.Item, { value: profile.id, children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-3 justify-between px-6 py-4", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx(radixUi.Accordion.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
            ui.IconButton,
            {
              size: "2xsmall",
              variant: "transparent",
              className: "group/trigger",
              children: /* @__PURE__ */ jsxRuntime.jsx(icons.TriangleRightMini, { className: "group-data-[state=open]/trigger:rotate-90 transition-transform" })
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex-1 flex items-center gap-x-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx(ShippingBadge, {}),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: profile.name }),
              /* @__PURE__ */ jsxRuntime.jsx(
                ui.Text,
                {
                  size: "small",
                  leading: "compact",
                  className: "text-ui-fg-subtle",
                  children: tp(
                    "draftOrdersPlugin.shippingSection.profileItemCount",
                    profile.items.length
                  )
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(ui.StatusBadge, { color: "orange", children: t("draftOrdersPlugin.shippingSection.requiresShipping") }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(ShippingProfileItems, { profile })
    ] }),
    !isLast && /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" })
  ] });
};
const ShippingProfileItems = ({ profile }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs(radixUi.Accordion.Content, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
    profile.items.map((item, idx) => {
      return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 flex items-center gap-x-3", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-5 h-[72px] flex flex-col justify-center items-center", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed", orientation: "vertical" }) }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "py-4 flex items-center gap-x-3", children: [
            /* @__PURE__ */ jsxRuntime.jsx("div", { className: "size-7 flex items-center justify-center tabular-nums", children: /* @__PURE__ */ jsxRuntime.jsxs(
              ui.Text,
              {
                size: "small",
                leading: "compact",
                className: "text-ui-fg-subtle",
                children: [
                  item.quantity,
                  "x"
                ]
              }
            ) }),
            /* @__PURE__ */ jsxRuntime.jsx(Thumbnail, { thumbnail: item.thumbnail }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { size: "small", leading: "compact", weight: "plus", children: [
                item.variant?.product?.title,
                " (",
                item.variant?.title,
                ")"
              ] }),
              /* @__PURE__ */ jsxRuntime.jsx(
                ui.Text,
                {
                  size: "small",
                  leading: "compact",
                  className: "text-ui-fg-subtle",
                  children: item.variant?.options?.map((option) => option.value).join(" · ")
                }
              )
            ] })
          ] })
        ] }, item.id),
        idx !== profile.items.length - 1 && /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" })
      ] }, item.id);
    })
  ] });
};
const Footer$1 = ({ isSomeProfilesAssigned }) => {
  const { t } = reactI18next.useTranslation();
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-6 py-4 flex items-center justify-end bg-ui-bg-component", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Link, { to: "shipping", children: isSomeProfilesAssigned ? t("draftOrdersPlugin.shippingSection.edit") : t("draftOrdersPlugin.shippingSection.add") }) }) });
};
const ShippingBadge = ({ className }) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "div",
    {
      className: ui.clx(
        "size-7 rounded-md shadow-borders-base flex items-center justify-center",
        className
      ),
      children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "size-6 rounded bg-ui-bg-component-hover flex items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(icons.Shopping, { className: "text-ui-fg-subtle" }) })
    }
  );
};
function getShippingProfileData(items) {
  const uniqueShippingProfiles = getUniqueShippingProfiles(items);
  const output = uniqueShippingProfiles.map((profile) => {
    return {
      id: profile.id,
      name: profile.name,
      items: items.filter(
        (item) => item.variant?.product?.shipping_profile?.id === profile.id
      )
    };
  });
  return output;
}
const getLocaleAmount = (amount, currencyCode) => {
  const formatter2 = new Intl.NumberFormat([], {
    style: "currency",
    currencyDisplay: "narrowSymbol",
    currency: currencyCode
  });
  return formatter2.format(amount);
};
const getNativeSymbol = (currencyCode) => {
  const formatted = new Intl.NumberFormat([], {
    style: "currency",
    currency: currencyCode,
    currencyDisplay: "narrowSymbol"
  }).format(0);
  return formatted.replace(/\d/g, "").replace(/[.,]/g, "").trim();
};
const getDecimalDigits = (currencyCode) => {
  const formatter2 = new Intl.NumberFormat(void 0, {
    style: "currency",
    currency: currencyCode
  });
  return formatter2.resolvedOptions().maximumFractionDigits;
};
const getStylizedAmount = (amount, currencyCode) => {
  const symbol = getNativeSymbol(currencyCode);
  const decimalDigits = getDecimalDigits(currencyCode);
  const total = amount.toLocaleString(void 0, {
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits
  });
  return `${symbol} ${total} ${currencyCode.toUpperCase()}`;
};
const SummarySection = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  const promotions = order.promotions || [];
  return /* @__PURE__ */ jsxRuntime.jsxs(ui.Container, { className: "p-0 overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-4 flex items-center justify-between gap-x-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.summary.title") }),
      /* @__PURE__ */ jsxRuntime.jsx(
        ActionMenu,
        {
          groups: [
            {
              actions: [
                {
                  label: t("draftOrdersPlugin.summary.editItems"),
                  icon: /* @__PURE__ */ jsxRuntime.jsx(icons.Plus, {}),
                  to: "items"
                }
              ]
            },
            {
              actions: [
                {
                  label: t("draftOrdersPlugin.summary.editPromotions"),
                  icon: /* @__PURE__ */ jsxRuntime.jsx(icons.ReceiptPercent, {}),
                  to: "promotions"
                }
              ]
            }
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
    /* @__PURE__ */ jsxRuntime.jsx("div", { children: order.items.sort((a, b) => {
      if (a.variant_id && !b.variant_id) {
        return -1;
      }
      return 1;
    }).map((item, idx) => /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntime.jsx(Item$1, { item, currencyCode: order.currency_code }),
      idx !== order.items.length - 1 && /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" })
    ] }, item.id)) }),
    /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
    /* @__PURE__ */ jsxRuntime.jsx(
      Total,
      {
        currencyCode: order.currency_code,
        total: order.total,
        shippingSubtotal: order.shipping_subtotal,
        discountTotal: order.discount_total,
        promotions,
        taxTotal: order.tax_total,
        itemSubTotal: order.item_subtotal,
        itemCount: order.items?.reduce((acc, item) => acc + item.quantity, 0) || 0
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
    /* @__PURE__ */ jsxRuntime.jsx(Footer, { order })
  ] });
};
const Item$1 = ({ item, currencyCode }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "px-6 py-4 grid grid-cols-2 gap-3", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-3", children: [
      item.variant_id && /* @__PURE__ */ jsxRuntime.jsx(Thumbnail, { thumbnail: item.thumbnail, alt: item.title }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: item.product_title || item.title }),
          item.variant_title && /* @__PURE__ */ jsxRuntime.jsxs(
            ui.Text,
            {
              size: "small",
              leading: "compact",
              className: "text-ui-fg-subtle",
              children: [
                "(",
                item.variant_title,
                ")"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", className: "text-ui-fg-subtle", children: item.variant_sku })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-3 items-center gap-3 [&>div]:text-right text-ui-fg-subtle", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: getLocaleAmount(item.unit_price, currencyCode) }) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsxs(ui.Text, { children: [
        item.quantity,
        "x"
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { children: getLocaleAmount(item.subtotal, currencyCode) }) })
    ] })
  ] });
};
const Total = ({
  total,
  discountTotal,
  shippingSubtotal,
  taxTotal,
  currencyCode,
  promotions,
  itemSubTotal,
  itemCount
}) => {
  const { t } = reactI18next.useTranslation();
  const tp = usePlural();
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col px-6 py-4 gap-y-2", children: [
    itemCount > 0 && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-3 items-center justify-between gap-x-4 text-ui-fg-subtle", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: t("draftOrdersPlugin.summary.subtotal") }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-end", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: tp("draftOrdersPlugin.summary.itemCount", itemCount) }) }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-end", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: getLocaleAmount(itemSubTotal, currencyCode) }) })
    ] }),
    shippingSubtotal !== null && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between gap-x-4 text-ui-fg-subtle", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: t("draftOrdersPlugin.summary.shipping") }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: getLocaleAmount(shippingSubtotal, currencyCode) })
    ] }),
    discountTotal !== null && /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: ui.clx(
          "grid grid-cols-2 items-center gap-x-4 text-ui-fg-subtle",
          {
            "grid-cols-3": !!promotions
          }
        ),
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: t("draftOrdersPlugin.summary.discount") }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-end gap-x-2", children: promotions.map((promotion) => /* @__PURE__ */ jsxRuntime.jsx(reactRouterDom.Link, { to: `/promotions/${promotion.id}`, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: promotion.code }) }, promotion.id)) }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-end", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: getLocaleAmount(discountTotal, currencyCode) }) })
        ]
      }
    ),
    taxTotal !== null && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between gap-x-4 text-ui-fg-subtle", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: t("draftOrdersPlugin.summary.tax") }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: taxTotal > 0 ? getLocaleAmount(taxTotal, currencyCode) : "-" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between gap-x-4", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", weight: "plus", children: t("draftOrdersPlugin.summary.total") }),
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Text,
        {
          size: "small",
          leading: "compact",
          weight: "plus",
          className: "text-right",
          children: getStylizedAmount(total, currencyCode)
        }
      )
    ] })
  ] });
};
const Footer = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  const navigate = reactRouterDom.useNavigate();
  const prompt = ui.usePrompt();
  const { mutateAsync: convertDraftOrder, isPending } = useConvertDraftOrder(
    order.id
  );
  const handleConvert = async () => {
    const res = await prompt({
      title: t("draftOrdersPlugin.summary.convert.title"),
      description: t("draftOrdersPlugin.summary.convert.description"),
      confirmText: t("draftOrdersPlugin.general.confirm"),
      cancelText: t("draftOrdersPlugin.general.cancel"),
      variant: "confirmation"
    });
    if (!res) {
      return;
    }
    await convertDraftOrder(void 0, {
      onSuccess: () => {
        ui.toast.success(t("draftOrdersPlugin.summary.convert.success"));
        navigate(`/orders/${order.id}`);
      },
      onError: (error) => {
        ui.toast.error(error.message);
      }
    });
  };
  return /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-6 py-4 flex items-center justify-end gap-x-2 bg-ui-bg-component", children: /* @__PURE__ */ jsxRuntime.jsx(
    ui.Button,
    {
      size: "small",
      variant: "secondary",
      isLoading: isPending,
      onClick: handleConvert,
      children: t("draftOrdersPlugin.summary.convert.action")
    }
  ) });
};
async function loader({ params }) {
  const { id } = params;
  const data = await sdk.admin.order.retrieve(id, {
    fields: "id,display_id"
  });
  return data;
}
const handle = {
  breadcrumb: (match) => `#${match.loaderData.order.display_id}`
};
const ID = () => {
  const { id } = reactRouterDom.useParams();
  const { order, isPending, isError, error } = useOrder(id, {
    fields: "+customer.*,+sales_channel.*,+region.*,+email,+items.*,+items.variant.*,+items.variant.product.*,+items.variant.product.shipping_profile.*,+items.variant.options.*,+currency_code,+promotions.*"
  });
  const {
    order_changes,
    isPending: isOrderChangesPending,
    isError: isOrderChangesError,
    error: orderChangesError
  } = useOrderChanges(id, {
    change_type: ["edit", "transfer", "update_order"]
  });
  if (isError) {
    throw error;
  }
  if (isOrderChangesError) {
    throw orderChangesError;
  }
  const isReady = !isPending && !isOrderChangesPending && !!order && !!order_changes;
  if (!isReady) {
    return /* @__PURE__ */ jsxRuntime.jsx(
      PageSkeleton,
      {
        mainSections: 3,
        sidebarSections: 2,
        showJSON: true,
        showMetadata: true
      }
    );
  }
  return /* @__PURE__ */ jsxRuntime.jsx(
    components.LayoutComposer,
    {
      widgetsZonePrefix: "draft_order.details",
      preferredLayoutId: "core:two-column",
      data: order,
      sections: {
        main: /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(components.LayoutComposer.Entry, { id: "ActiveOrderChange", children: /* @__PURE__ */ jsxRuntime.jsx(ActiveOrderChange, { orderId: order.id }) }),
          /* @__PURE__ */ jsxRuntime.jsx(components.LayoutComposer.Entry, { id: "GeneralSection", children: /* @__PURE__ */ jsxRuntime.jsx(GeneralSection, { order }) }),
          /* @__PURE__ */ jsxRuntime.jsx(components.LayoutComposer.Entry, { id: "SummarySection", children: /* @__PURE__ */ jsxRuntime.jsx(SummarySection, { order }) }),
          /* @__PURE__ */ jsxRuntime.jsx(components.LayoutComposer.Entry, { id: "ShippingSection", children: /* @__PURE__ */ jsxRuntime.jsx(ShippingSection, { order }) }),
          /* @__PURE__ */ jsxRuntime.jsx(components.LayoutComposer.Entry, { id: "MetadataSection", children: /* @__PURE__ */ jsxRuntime.jsx(MetadataSection, { order }) }),
          /* @__PURE__ */ jsxRuntime.jsx(components.LayoutComposer.Entry, { id: "JsonViewSection", children: /* @__PURE__ */ jsxRuntime.jsx(JsonViewSection, { data: order }) })
        ] }),
        side: /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(components.LayoutComposer.Entry, { id: "CustomerSection", children: /* @__PURE__ */ jsxRuntime.jsx(CustomerSection, { order }) }),
          /* @__PURE__ */ jsxRuntime.jsx(components.LayoutComposer.Entry, { id: "ActivitySection", children: /* @__PURE__ */ jsxRuntime.jsx(ActivitySection, { order, changes: order_changes }) })
        ] })
      }
    }
  );
};
const BillingAddress = () => {
  const { t } = reactI18next.useTranslation();
  const { id } = reactRouterDom.useParams();
  const { order, isPending, isError, error } = useOrder(id, {
    fields: "+billing_address"
  });
  if (isError) {
    throw error;
  }
  const isReady = !isPending && !!order;
  return /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer.Header, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.billingAddress.title") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.billingAddress.description") }) })
    ] }),
    isReady && /* @__PURE__ */ jsxRuntime.jsx(BillingAddressForm, { order })
  ] });
};
const BillingAddressForm = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  const zodErrorMap = useZodErrorMap();
  const form = reactHookForm.useForm({
    defaultValues: {
      first_name: order.billing_address?.first_name ?? "",
      last_name: order.billing_address?.last_name ?? "",
      company: order.billing_address?.company ?? "",
      address_1: order.billing_address?.address_1 ?? "",
      address_2: order.billing_address?.address_2 ?? "",
      city: order.billing_address?.city ?? "",
      province: order.billing_address?.province ?? "",
      country_code: order.billing_address?.country_code ?? "",
      postal_code: order.billing_address?.postal_code ?? "",
      phone: order.billing_address?.phone ?? ""
    },
    resolver: zod$1.zodResolver(schema$5, { error: zodErrorMap })
  });
  const { mutateAsync, isPending } = useUpdateDraftOrder(order.id);
  const { handleSuccess } = useRouteModal();
  const onSubmit = form.handleSubmit(async (data) => {
    await mutateAsync(
      { billing_address: data },
      {
        onSuccess: () => {
          handleSuccess();
        },
        onError: (error) => {
          ui.toast.error(error.message);
        }
      }
    );
  });
  return /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Form, { form, children: /* @__PURE__ */ jsxRuntime.jsxs(
    KeyboundForm,
    {
      className: "flex flex-1 flex-col overflow-hidden",
      onSubmit,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Body, { className: "flex flex-col gap-y-6 overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "country_code",
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.country") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(CountrySelect, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Form$2.Field,
              {
                control: form.control,
                name: "first_name",
                render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.firstName") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Form$2.Field,
              {
                control: form.control,
                name: "last_name",
                render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.lastName") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "company",
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, children: t("draftOrdersPlugin.fields.company") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "address_1",
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.address") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "address_2",
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, children: t("draftOrdersPlugin.fields.address2") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Form$2.Field,
              {
                control: form.control,
                name: "postal_code",
                render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.postalCode") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Form$2.Field,
              {
                control: form.control,
                name: "city",
                render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.city") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "province",
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, children: t("draftOrdersPlugin.fields.province") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "phone",
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, children: t("draftOrdersPlugin.fields.phone") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", children: t("draftOrdersPlugin.general.cancel") }) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", type: "submit", isLoading: isPending, children: t("draftOrdersPlugin.general.save") })
        ] }) })
      ]
    }
  ) });
};
const schema$5 = addressSchema;
const Email = () => {
  const { t } = reactI18next.useTranslation();
  const { id } = reactRouterDom.useParams();
  const { order, isPending, isError, error } = useOrder(id, {
    fields: "+email"
  });
  if (isError) {
    throw error;
  }
  const isReady = !isPending && !!order;
  return /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer.Header, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.email.title") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.email.description") }) })
    ] }),
    isReady && /* @__PURE__ */ jsxRuntime.jsx(EmailForm, { order })
  ] });
};
const EmailForm = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  const zodErrorMap = useZodErrorMap();
  const form = reactHookForm.useForm({
    defaultValues: {
      email: order.email ?? ""
    },
    resolver: zod$1.zodResolver(schema$4, { error: zodErrorMap })
  });
  const { mutateAsync, isPending } = useUpdateDraftOrder(order.id);
  const { handleSuccess } = useRouteModal();
  const onSubmit = form.handleSubmit(async (data) => {
    await mutateAsync(
      { email: data.email },
      {
        onSuccess: () => {
          handleSuccess();
        },
        onError: (error) => {
          ui.toast.error(error.message);
        }
      }
    );
  });
  return /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Form, { form, children: /* @__PURE__ */ jsxRuntime.jsxs(
    KeyboundForm,
    {
      className: "flex flex-1 flex-col overflow-hidden",
      onSubmit,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Body, { className: "flex flex-col gap-y-6 overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsx(
          Form$2.Field,
          {
            control: form.control,
            name: "email",
            render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.email") }),
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", children: t("draftOrdersPlugin.general.cancel") }) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", type: "submit", isLoading: isPending, children: t("draftOrdersPlugin.general.save") })
        ] }) })
      ]
    }
  ) });
};
const schema$4 = zod.z.object({
  email: zod.z.string().email()
});
const NumberInput = React.forwardRef(
  ({
    value,
    onChange,
    size = "base",
    min = 0,
    max = 100,
    step = 1,
    className,
    disabled,
    ...props
  }, ref) => {
    const { t } = reactI18next.useTranslation();
    const handleChange = (event) => {
      const newValue = event.target.value === "" ? min : Number(event.target.value);
      if (!isNaN(newValue) && (max === void 0 || newValue <= max) && (min === void 0 || newValue >= min)) {
        onChange(newValue);
      }
    };
    const handleIncrement = () => {
      const newValue = value + step;
      if (max === void 0 || newValue <= max) {
        onChange(newValue);
      }
    };
    const handleDecrement = () => {
      const newValue = value - step;
      if (min === void 0 || newValue >= min) {
        onChange(newValue);
      }
    };
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        className: ui.clx(
          "inline-flex rounded-md bg-ui-bg-field shadow-borders-base overflow-hidden divide-x transition-fg",
          "[&:has(input:focus)]:shadow-borders-interactive-with-active",
          {
            "h-7": size === "small",
            "h-8": size === "base"
          },
          className
        ),
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "input",
            {
              ref,
              type: "number",
              value,
              onChange: handleChange,
              min,
              max,
              step,
              className: ui.clx(
                "flex-1 px-2 py-1 bg-transparent txt-compact-small text-ui-fg-base outline-none [appearance:textfield]",
                "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
                "placeholder:text-ui-fg-muted"
              ),
              ...props
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "button",
            {
              className: ui.clx(
                "flex items-center justify-center outline-none transition-fg",
                "disabled:cursor-not-allowed disabled:text-ui-fg-muted",
                "focus:bg-ui-bg-field-component-hover",
                "hover:bg-ui-bg-field-component-hover",
                {
                  "size-7": size === "small",
                  "size-8": size === "base"
                }
              ),
              type: "button",
              onClick: handleDecrement,
              disabled: min !== void 0 && value <= min || disabled,
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(icons.Minus, {}),
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.numberInput.decrease", { step }) })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs(
            "button",
            {
              className: ui.clx(
                "flex items-center justify-center outline-none transition-fg",
                "disabled:cursor-not-allowed disabled:text-ui-fg-muted",
                "focus:bg-ui-bg-field-hover",
                "hover:bg-ui-bg-field-hover",
                {
                  "size-7": size === "small",
                  "size-8": size === "base"
                }
              ),
              type: "button",
              onClick: handleIncrement,
              disabled: max !== void 0 && value >= max || disabled,
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(icons.Plus, {}),
                /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.numberInput.increase", { step }) })
              ]
            }
          )
        ]
      }
    );
  }
);
const PRODUCT_VARIANTS_QUERY_KEY = "product-variants";
const productVariantsQueryKeys = {
  list: (query2) => [
    PRODUCT_VARIANTS_QUERY_KEY,
    query2 ? query2 : void 0
  ]
};
const useProductVariants = (query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryKey: productVariantsQueryKeys.list(query2),
    queryFn: async () => await sdk.admin.productVariant.list(query2),
    ...options
  });
  return { ...data, ...rest };
};
const useCancelOrderEdit = ({ preview }) => {
  const { mutateAsync: cancelOrderEdit } = useDraftOrderCancelEdit(preview?.id);
  const onCancel = React.useCallback(async () => {
    if (!preview) {
      return true;
    }
    let res = false;
    await cancelOrderEdit(void 0, {
      onError: (e) => {
        ui.toast.error(e.message);
      },
      onSuccess: () => {
        res = true;
      }
    });
    return res;
  }, [preview, cancelOrderEdit]);
  return { onCancel };
};
let IS_REQUEST_RUNNING = false;
const useInitiateOrderEdit = ({
  preview
}) => {
  const navigate = reactRouterDom.useNavigate();
  const { mutateAsync } = useDraftOrderBeginEdit(preview?.id);
  React.useEffect(() => {
    async function run() {
      if (IS_REQUEST_RUNNING || !preview) {
        return;
      }
      if (preview.order_change) {
        return;
      }
      IS_REQUEST_RUNNING = true;
      await mutateAsync(void 0, {
        onError: (e) => {
          ui.toast.error(e.message);
          navigate(`/draft-orders/${preview.id}`, { replace: true });
          return;
        }
      });
      IS_REQUEST_RUNNING = false;
    }
    run();
  }, [preview, navigate, mutateAsync]);
};
function convertNumber(value) {
  return typeof value === "string" ? Number(value.replace(",", ".")) : value;
}
const STACKED_MODAL_ID = "items_stacked_modal";
const Items = () => {
  const { t } = reactI18next.useTranslation();
  const { id } = reactRouterDom.useParams();
  const {
    order: preview,
    isPending: isPreviewPending,
    isError: isPreviewError,
    error: previewError
  } = useOrderPreview(id, void 0, {
    placeholderData: reactQuery.keepPreviousData
  });
  useInitiateOrderEdit({ preview });
  const { draft_order, isPending, isError, error } = useDraftOrder(
    id,
    {
      fields: "currency_code"
    },
    {
      enabled: !!id
    }
  );
  const { onCancel } = useCancelOrderEdit({ preview });
  if (isError) {
    throw error;
  }
  if (isPreviewError) {
    throw previewError;
  }
  const ready = !!preview && !isPreviewPending && !!draft_order && !isPending;
  return /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal, { onClose: onCancel, children: ready ? /* @__PURE__ */ jsxRuntime.jsx(ItemsForm, { preview, currencyCode: draft_order.currency_code }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.items.title") }) }),
    /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.general.loading") }) })
  ] }) });
};
const ItemsForm = ({ preview, currencyCode }) => {
  const { t } = reactI18next.useTranslation();
  const tp = usePlural();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [modalContent, setModalContent] = React.useState(
    null
  );
  const { handleSuccess } = useRouteModal();
  const { searchValue, onSearchValueChange, query: query2 } = useDebouncedSearch();
  const { mutateAsync: confirmOrderEdit } = useDraftOrderConfirmEdit(preview.id);
  const { mutateAsync: requestOrderEdit } = useDraftOrderRequestEdit(preview.id);
  const itemCount = preview.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const matches = React.useMemo(() => {
    return matchSorter.matchSorter(preview.items, query2, {
      keys: ["product_title", "variant_title", "variant_sku", "title"]
    });
  }, [preview.items, query2]);
  const onSubmit = async () => {
    setIsSubmitting(true);
    let requestSucceeded = false;
    await requestOrderEdit(void 0, {
      onError: (e) => {
        ui.toast.error(
          t("draftOrdersPlugin.orderEdit.requestFailed", { message: e.message })
        );
      },
      onSuccess: () => {
        requestSucceeded = true;
      }
    });
    if (!requestSucceeded) {
      setIsSubmitting(false);
      return;
    }
    await confirmOrderEdit(void 0, {
      onError: (e) => {
        ui.toast.error(
          t("draftOrdersPlugin.orderEdit.confirmFailed", { message: e.message })
        );
      },
      onSuccess: () => {
        handleSuccess();
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    });
  };
  const onKeyDown = React.useCallback(
    (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        if (modalContent || isSubmitting) {
          return;
        }
        onSubmit();
      }
    },
    [modalContent, isSubmitting, onSubmit]
  );
  React.useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex h-full flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Header, {}),
    /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Body, { className: "flex flex-1 flex-col overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsxs(
      StackedFocusModal,
      {
        id: STACKED_MODAL_ID,
        onOpenChangeCallback: (open) => {
          if (!open) {
            setModalContent(null);
          }
        },
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-1 flex-col items-center overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full max-w-[720px] flex-col gap-y-6 px-6 py-16", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.items.title") }) }),
              /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: t("draftOrdersPlugin.items.description") }) })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-6", children: [
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: t("draftOrdersPlugin.items.itemsLabel") }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: t("draftOrdersPlugin.items.itemsHint") })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxRuntime.jsx(
                    ui.Input,
                    {
                      type: "search",
                      placeholder: t("draftOrdersPlugin.items.searchPlaceholder"),
                      value: searchValue,
                      onChange: (e) => onSearchValueChange(e.target.value)
                    }
                  ) }),
                  /* @__PURE__ */ jsxRuntime.jsxs(ui.DropdownMenu, { children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.DropdownMenu.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.IconButton, { type: "button", children: /* @__PURE__ */ jsxRuntime.jsx(icons.Plus, {}) }) }),
                    /* @__PURE__ */ jsxRuntime.jsxs(ui.DropdownMenu.Content, { children: [
                      /* @__PURE__ */ jsxRuntime.jsx(
                        StackedModalTrigger$1,
                        {
                          type: "add-items",
                          setModalContent
                        }
                      ),
                      /* @__PURE__ */ jsxRuntime.jsx(
                        StackedModalTrigger$1,
                        {
                          type: "add-custom-item",
                          setModalContent
                        }
                      )
                    ] })
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-subtle shadow-elevation-card-rest rounded-xl", children: [
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-[5px]", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-ui-fg-muted grid grid-cols-[2fr_1fr_2fr_28px] gap-3 px-4 py-2", children: [
                  /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: t("draftOrdersPlugin.items.columns.item") }) }),
                  /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: t("draftOrdersPlugin.items.columns.quantity") }) }),
                  /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: t("draftOrdersPlugin.items.columns.price") }) }),
                  /* @__PURE__ */ jsxRuntime.jsx("div", {})
                ] }) }),
                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-y-1.5 px-[5px] pb-[5px]", children: itemCount <= 0 ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-base shadow-elevation-card-rest flex flex-col items-center justify-center gap-1 gap-x-3 rounded-lg p-4", children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: t("draftOrdersPlugin.items.empty.title") }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: t("draftOrdersPlugin.items.empty.description") })
                ] }) : matches.length > 0 ? matches?.map((item) => /* @__PURE__ */ jsxRuntime.jsx(
                  Item,
                  {
                    item,
                    preview,
                    currencyCode
                  },
                  item.id
                )) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-base shadow-elevation-card-rest flex flex-col items-center justify-center gap-1 gap-x-3 rounded-lg p-4", children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: t("draftOrdersPlugin.items.noResults.title") }),
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: t("draftOrdersPlugin.items.noResults.description", {
                    query: query2
                  }) })
                ] }) })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-[1fr_0.5fr_0.5fr] gap-3", children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: t("draftOrdersPlugin.summary.subtotal") }) }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(
                ui.Text,
                {
                  size: "small",
                  leading: "compact",
                  className: "text-ui-fg-subtle",
                  children: tp("draftOrdersPlugin.summary.itemCount", itemCount)
                }
              ) }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: getStylizedAmount(preview.item_subtotal, currencyCode) }) })
            ] })
          ] }) }),
          modalContent && (modalContent === "add-items" ? /* @__PURE__ */ jsxRuntime.jsx(ExistingItemsForm, { orderId: preview.id, items: preview.items }) : modalContent === "add-custom-item" ? /* @__PURE__ */ jsxRuntime.jsx(
            CustomItemForm,
            {
              orderId: preview.id,
              currencyCode
            }
          ) : null)
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-x-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", type: "button", children: t("draftOrdersPlugin.general.cancel") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          size: "small",
          type: "button",
          onClick: onSubmit,
          isLoading: isSubmitting,
          children: t("draftOrdersPlugin.general.save")
        }
      )
    ] }) })
  ] });
};
const Item = ({ item, preview, currencyCode }) => {
  if (item.variant_id) {
    return /* @__PURE__ */ jsxRuntime.jsx(VariantItem, { item, preview, currencyCode });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(CustomItem, { item, preview, currencyCode });
};
const VariantItem = ({ item, preview, currencyCode }) => {
  const [editing, setEditing] = React.useState(false);
  const zodErrorMap = useZodErrorMap();
  const form = reactHookForm.useForm({
    defaultValues: {
      quantity: item.quantity,
      unit_price: item.unit_price
    },
    resolver: zod$1.zodResolver(variantItemSchema, { error: zodErrorMap })
  });
  const actionId = React.useMemo(() => {
    return item.actions?.find((a) => a.action === "ITEM_ADD")?.id;
  }, [item]);
  const { mutateAsync: updateActionItem, isPending: isUpdatingActionItem } = useDraftOrderUpdateActionItem(preview.id);
  const { mutateAsync: removeActionItem, isPending: isRemovingActionItem } = useDraftOrderRemoveActionItem(preview.id);
  const { mutateAsync: updateOriginalItem, isPending: isUpdatingOriginalItem } = useDraftOrderUpdateItem(preview.id);
  const isPending = isUpdatingActionItem || isUpdatingOriginalItem || isRemovingActionItem;
  const onSubmit = form.handleSubmit(async (data) => {
    if (convertNumber(data.unit_price) === item.unit_price && data.quantity === item.quantity) {
      setEditing(false);
      return;
    }
    if (!actionId) {
      await updateOriginalItem(
        {
          item_id: item.id,
          quantity: data.quantity,
          unit_price: convertNumber(data.unit_price)
        },
        {
          onSuccess: () => {
            setEditing(false);
          },
          onError: (e) => {
            ui.toast.error(e.message);
          }
        }
      );
      return;
    }
    if (data.quantity === 0) {
      await removeActionItem(actionId, {
        onSuccess: () => {
          setEditing(false);
        },
        onError: (e) => {
          ui.toast.error(e.message);
        }
      });
      return;
    }
    await updateActionItem(
      {
        action_id: actionId,
        quantity: data.quantity,
        unit_price: convertNumber(data.unit_price)
      },
      {
        onSuccess: () => {
          setEditing(false);
        },
        onError: (e) => {
          ui.toast.error(e.message);
        }
      }
    );
  });
  return /* @__PURE__ */ jsxRuntime.jsx(Form$2, { ...form, children: /* @__PURE__ */ jsxRuntime.jsx("form", { onSubmit, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-base shadow-elevation-card-rest grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,2fr)_28px] items-center gap-3 rounded-lg px-4 py-2", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full items-center gap-x-3", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        Thumbnail,
        {
          thumbnail: item.thumbnail,
          alt: item.product_title ?? void 0
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-1", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: item.product_title }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            ui.Text,
            {
              size: "small",
              leading: "compact",
              className: "text-ui-fg-subtle",
              children: [
                "(",
                item.variant_title,
                ")"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.Text,
          {
            size: "small",
            leading: "compact",
            className: "text-ui-fg-subtle",
            children: item.variant_sku
          }
        )
      ] })
    ] }),
    editing ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full flex-1", children: /* @__PURE__ */ jsxRuntime.jsx(
      Form$2.Field,
      {
        control: form.control,
        name: "quantity",
        render: ({ field }) => {
          return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(NumberInput, { ...field }) }) });
        }
      }
    ) }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full flex-1", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: item.quantity }) }),
    editing ? /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full flex-1", children: /* @__PURE__ */ jsxRuntime.jsx(
      Form$2.Field,
      {
        control: form.control,
        name: "unit_price",
        render: ({ field: { onChange, ...field } }) => {
          return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
            ui.CurrencyInput,
            {
              ...field,
              symbol: getNativeSymbol(currencyCode),
              code: currencyCode,
              onValueChange: (_value, _name, values) => onChange(values?.value)
            }
          ) }) });
        }
      }
    ) }) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex w-full flex-1 items-center justify-end", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: getLocaleAmount(item.unit_price, currencyCode) }) }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ui.IconButton,
      {
        type: "button",
        size: "small",
        onClick: editing ? onSubmit : () => {
          setEditing(true);
        },
        disabled: isPending,
        children: editing ? /* @__PURE__ */ jsxRuntime.jsx(icons.Check, {}) : /* @__PURE__ */ jsxRuntime.jsx(icons.PencilSquare, {})
      }
    )
  ] }) }) });
};
const variantItemSchema = zod.z.object({
  quantity: zod.z.number(),
  unit_price: zod.z.union([zod.z.number(), zod.z.string()])
});
const CustomItem = ({ item, preview, currencyCode }) => {
  const [editing, setEditing] = React.useState(false);
  const zodErrorMap = useZodErrorMap();
  const { quantity, unit_price, title } = item;
  const form = reactHookForm.useForm({
    defaultValues: {
      title,
      quantity,
      unit_price
    },
    resolver: zod$1.zodResolver(customItemSchema, { error: zodErrorMap })
  });
  React.useEffect(() => {
    form.reset({
      title,
      quantity,
      unit_price
    });
  }, [form, title, quantity, unit_price]);
  const actionId = React.useMemo(() => {
    return item.actions?.find((a) => a.action === "ITEM_ADD")?.id;
  }, [item]);
  const { mutateAsync: updateActionItem, isPending: isUpdatingActionItem } = useDraftOrderUpdateActionItem(preview.id);
  const { mutateAsync: removeActionItem, isPending: isRemovingActionItem } = useDraftOrderRemoveActionItem(preview.id);
  const { mutateAsync: updateOriginalItem, isPending: isUpdatingOriginalItem } = useDraftOrderUpdateItem(preview.id);
  const isPending = isUpdatingActionItem || isUpdatingOriginalItem;
  const onSubmit = form.handleSubmit(async (data) => {
    if (convertNumber(data.unit_price) === item.unit_price && data.quantity === item.quantity && data.title === item.title) {
      setEditing(false);
      return;
    }
    if (!actionId) {
      await updateOriginalItem(
        {
          item_id: item.id,
          quantity: data.quantity,
          unit_price: convertNumber(data.unit_price)
        },
        {
          onSuccess: () => {
            setEditing(false);
          },
          onError: (e) => {
            ui.toast.error(e.message);
          }
        }
      );
      return;
    }
    if (data.quantity === 0) {
      await removeActionItem(actionId, {
        onSuccess: () => {
          setEditing(false);
        },
        onError: (e) => {
          ui.toast.error(e.message);
        }
      });
      return;
    }
    await updateActionItem(
      {
        action_id: actionId,
        quantity: data.quantity,
        unit_price: convertNumber(data.unit_price)
      },
      {
        onSuccess: () => {
          setEditing(false);
        },
        onError: (e) => {
          ui.toast.error(e.message);
        }
      }
    );
  });
  return /* @__PURE__ */ jsxRuntime.jsx(Form$2, { ...form, children: /* @__PURE__ */ jsxRuntime.jsx("form", { onSubmit, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-base shadow-elevation-card-rest grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,2fr)_28px] items-center gap-3 rounded-lg px-4 py-2", children: [
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-3", children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        Thumbnail,
        {
          thumbnail: item.thumbnail,
          alt: item.title ?? void 0
        }
      ),
      editing ? /* @__PURE__ */ jsxRuntime.jsx(
        Form$2.Field,
        {
          control: form.control,
          name: "title",
          render: ({ field }) => {
            return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }) });
          }
        }
      ) : /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: item.title })
    ] }),
    editing ? /* @__PURE__ */ jsxRuntime.jsx(
      Form$2.Field,
      {
        control: form.control,
        name: "quantity",
        render: ({ field }) => {
          return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(NumberInput, { ...field }) }) });
        }
      }
    ) : /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: item.quantity }),
    editing ? /* @__PURE__ */ jsxRuntime.jsx(
      Form$2.Field,
      {
        control: form.control,
        name: "unit_price",
        render: ({ field: { onChange, ...field } }) => {
          return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
            ui.CurrencyInput,
            {
              ...field,
              symbol: getNativeSymbol(currencyCode),
              code: currencyCode,
              onValueChange: (_value, _name, values) => onChange(values?.value)
            }
          ) }) });
        }
      }
    ) : /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-1 items-center justify-end", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: getLocaleAmount(item.unit_price, currencyCode) }) }),
    /* @__PURE__ */ jsxRuntime.jsx(
      ui.IconButton,
      {
        type: "button",
        size: "small",
        onClick: editing ? onSubmit : () => {
          setEditing(true);
        },
        disabled: isPending,
        children: editing ? /* @__PURE__ */ jsxRuntime.jsx(icons.Check, {}) : /* @__PURE__ */ jsxRuntime.jsx(icons.PencilSquare, {})
      }
    )
  ] }) }) });
};
const StackedModalTrigger$1 = ({
  type,
  setModalContent
}) => {
  const { t } = reactI18next.useTranslation();
  const { setIsOpen } = useStackedModal();
  const onClick = React.useCallback(() => {
    setModalContent(type);
    setIsOpen(STACKED_MODAL_ID, true);
  }, [setModalContent, setIsOpen, type]);
  return /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.DropdownMenu.Item, { onClick, children: type === "add-items" ? t("draftOrdersPlugin.items.addItems") : t("draftOrdersPlugin.items.addCustomItem") }) });
};
const VARIANT_PREFIX = "items";
const LIMIT = 50;
const ExistingItemsForm = ({ orderId, items }) => {
  const { t } = reactI18next.useTranslation();
  const { setIsOpen } = useStackedModal();
  const [rowSelection, setRowSelection] = React.useState(
    items.reduce((acc, item) => {
      acc[item.variant_id] = true;
      return acc;
    }, {})
  );
  React.useEffect(() => {
    setRowSelection(
      items.reduce((acc, item) => {
        if (item.variant_id) {
          acc[item.variant_id] = true;
        }
        return acc;
      }, {})
    );
  }, [items]);
  const { q, order, offset } = useQueryParams(
    ["q", "order", "offset"],
    VARIANT_PREFIX
  );
  const { variants, count, isPending, isError, error } = useProductVariants(
    {
      q,
      order,
      offset: offset ? parseInt(offset) : void 0,
      limit: LIMIT,
      fields: "*inventory_items.inventory.location_levels,+inventory_quantity,+manage_inventory"
    },
    {
      placeholderData: reactQuery.keepPreviousData
    }
  );
  const columns = useColumns();
  const { mutateAsync } = useDraftOrderAddItems(orderId);
  const onSubmit = async () => {
    const ids = Object.keys(rowSelection).filter(
      (id) => !items.find((i) => i.variant_id === id)
    );
    await mutateAsync(
      {
        items: ids.map((id) => ({
          variant_id: id,
          quantity: 1
        }))
      },
      {
        onSuccess: () => {
          setRowSelection({});
          setIsOpen(STACKED_MODAL_ID, false);
        },
        onError: (e) => {
          ui.toast.error(e.message);
        }
      }
    );
  };
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(
    StackedFocusModal.Content,
    {
      onOpenAutoFocus: (e) => {
        e.preventDefault();
        const searchInput = document.querySelector(
          "[data-modal-id='modal-search-input']"
        );
        if (searchInput) {
          searchInput.focus();
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(StackedFocusModal.Header, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.variants.title") }) }),
          /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.variants.description") }) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Body, { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx(
          DataTable,
          {
            data: variants,
            columns,
            isLoading: isPending,
            getRowId: (row) => row.id,
            rowCount: count,
            prefix: VARIANT_PREFIX,
            layout: "fill",
            rowSelection: {
              state: rowSelection,
              onRowSelectionChange: setRowSelection,
              enableRowSelection: (row) => {
                return !items.find((i) => i.variant_id === row.original.id);
              }
            },
            autoFocusSearch: true
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-x-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", type: "button", children: t("draftOrdersPlugin.general.cancel") }) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", type: "button", onClick: onSubmit, children: t("draftOrdersPlugin.variants.submit") })
        ] }) })
      ]
    }
  );
};
const columnHelper = ui.createDataTableColumnHelper();
const getVariantInventory = (variant, t, tp) => {
  if (!variant.manage_inventory) {
    return {
      text: t("draftOrdersPlugin.variants.notManaged"),
      hasInventoryKit: false,
      notManaged: true
    };
  }
  const quantity = variant.inventory_quantity;
  const inventoryItems = variant.inventory_items?.map((i) => i.inventory).filter(Boolean) ?? [];
  const hasInventoryKit = inventoryItems.length > 1;
  const locations = {};
  inventoryItems.forEach((i) => {
    i.location_levels?.forEach((l) => {
      locations[l.id] = true;
    });
  });
  const locationCount = Object.keys(locations).length;
  const available = tp("draftOrdersPlugin.variants.available", quantity ?? 0, {
    quantity
  });
  const text = hasInventoryKit ? available : t("draftOrdersPlugin.variants.availableAtLocations", {
    available,
    locations: tp("draftOrdersPlugin.variants.locations", locationCount)
  });
  return { text, hasInventoryKit, quantity, notManaged: false };
};
const useColumns = () => {
  const { t } = reactI18next.useTranslation();
  const tp = usePlural();
  const { getFullDate: getFullDate2 } = useDate();
  return React.useMemo(() => {
    return [
      columnHelper.select(),
      columnHelper.accessor("product.title", {
        header: t("draftOrdersPlugin.variants.columns.product"),
        cell: ({ row }) => {
          return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Thumbnail,
              {
                thumbnail: row.original.product?.thumbnail,
                alt: row.original.product?.title
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx("span", { children: row.original.product?.title })
          ] });
        },
        enableSorting: true
      }),
      columnHelper.accessor("title", {
        header: t("draftOrdersPlugin.variants.columns.variant"),
        enableSorting: true
      }),
      columnHelper.accessor("sku", {
        header: t("draftOrdersPlugin.variants.columns.sku"),
        cell: ({ getValue }) => {
          return getValue() ?? "-";
        },
        enableSorting: true
      }),
      columnHelper.accessor("updated_at", {
        header: t("draftOrdersPlugin.variants.columns.updated"),
        cell: ({ getValue }) => {
          return /* @__PURE__ */ jsxRuntime.jsx(
            ui.Tooltip,
            {
              content: getFullDate2({ date: getValue(), includeTime: true }),
              children: /* @__PURE__ */ jsxRuntime.jsx("span", { children: getFullDate2({ date: getValue() }) })
            }
          );
        },
        enableSorting: true,
        sortAscLabel: t("draftOrdersPlugin.variants.oldestFirst"),
        sortDescLabel: t("draftOrdersPlugin.variants.newestFirst")
      }),
      columnHelper.accessor("created_at", {
        header: t("draftOrdersPlugin.variants.columns.created"),
        cell: ({ getValue }) => {
          return /* @__PURE__ */ jsxRuntime.jsx(
            ui.Tooltip,
            {
              content: getFullDate2({ date: getValue(), includeTime: true }),
              children: /* @__PURE__ */ jsxRuntime.jsx("span", { children: getFullDate2({ date: getValue() }) })
            }
          );
        },
        enableSorting: true,
        sortAscLabel: t("draftOrdersPlugin.variants.oldestFirst"),
        sortDescLabel: t("draftOrdersPlugin.variants.newestFirst")
      }),
      columnHelper.display({
        id: "inventory",
        header: t("draftOrdersPlugin.variants.columns.stock"),
        cell: ({ row }) => {
          const { text, hasInventoryKit, quantity, notManaged } = getVariantInventory(row.original, t, tp);
          return /* @__PURE__ */ jsxRuntime.jsx(ui.Tooltip, { content: text, children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex h-full w-full items-center gap-2 overflow-hidden", children: [
            hasInventoryKit && /* @__PURE__ */ jsxRuntime.jsx(icons.Component, {}),
            /* @__PURE__ */ jsxRuntime.jsx(
              "span",
              {
                className: ui.clx("truncate", {
                  "text-ui-fg-error": !quantity && !notManaged
                }),
                children: text
              }
            )
          ] }) });
        }
      })
    ];
  }, [t, tp, getFullDate2]);
};
const CustomItemForm = ({ orderId, currencyCode }) => {
  const { t } = reactI18next.useTranslation();
  const zodErrorMap = useZodErrorMap();
  const { setIsOpen } = useStackedModal();
  const { mutateAsync: addItems } = useDraftOrderAddItems(orderId);
  const form = reactHookForm.useForm({
    defaultValues: {
      title: "",
      quantity: 1,
      unit_price: ""
    },
    resolver: zod$1.zodResolver(customItemSchema, { error: zodErrorMap })
  });
  const onSubmit = form.handleSubmit(async (data) => {
    await addItems(
      {
        items: [
          {
            title: data.title,
            quantity: data.quantity,
            unit_price: convertNumber(data.unit_price)
          }
        ]
      },
      {
        onSuccess: () => {
          setIsOpen(STACKED_MODAL_ID, false);
        },
        onError: (e) => {
          ui.toast.error(e.message);
        }
      }
    );
  });
  return /* @__PURE__ */ jsxRuntime.jsx(Form$2, { ...form, children: /* @__PURE__ */ jsxRuntime.jsx(KeyboundForm, { onSubmit, children: /* @__PURE__ */ jsxRuntime.jsxs(StackedFocusModal.Content, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Header, {}),
    /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Body, { className: "flex flex-1 flex-col overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-1 flex-col items-center overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full max-w-[720px] flex-col gap-y-6 px-2 py-16", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.customItem.title") }) }),
        /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: t("draftOrdersPlugin.customItem.description") }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        Form$2.Field,
        {
          control: form.control,
          name: "title",
          render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-x-3", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.customItem.titleLabel") }),
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.customItem.titleHint") })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
            ] })
          ] }) })
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        Form$2.Field,
        {
          control: form.control,
          name: "unit_price",
          render: ({ field: { onChange, ...field } }) => /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-x-3", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.customItem.unitPriceLabel") }),
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.customItem.unitPriceHint") })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
                ui.CurrencyInput,
                {
                  symbol: getNativeSymbol(currencyCode),
                  code: currencyCode,
                  onValueChange: (_value, _name, values) => onChange(values?.value),
                  ...field
                }
              ) }),
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
            ] })
          ] }) })
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
      /* @__PURE__ */ jsxRuntime.jsx(
        Form$2.Field,
        {
          control: form.control,
          name: "quantity",
          render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-x-3", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.customItem.quantityLabel") }),
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.customItem.quantityHint") })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "w-full flex-1", children: [
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "w-full flex-1", children: /* @__PURE__ */ jsxRuntime.jsx(NumberInput, { ...field, className: "w-full" }) }) }),
              /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
            ] })
          ] }) })
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-x-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", type: "button", children: t("draftOrdersPlugin.general.cancel") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", type: "button", onClick: onSubmit, children: t("draftOrdersPlugin.customItem.submit") })
    ] }) })
  ] }) }) });
};
const customItemSchema = zod.z.object({
  title: zod.z.string().min(1),
  quantity: zod.z.number(),
  unit_price: zod.z.union([zod.z.number(), zod.z.string()])
});
const CustomItems = () => {
  const { t } = reactI18next.useTranslation();
  return /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Header, { children: /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.customItems.title") }) }) }),
    /* @__PURE__ */ jsxRuntime.jsx(CustomItemsForm, {})
  ] });
};
const CustomItemsForm = () => {
  const { t } = reactI18next.useTranslation();
  const zodErrorMap = useZodErrorMap();
  const form = reactHookForm.useForm({
    resolver: zod$1.zodResolver(schema$3, { error: zodErrorMap })
  });
  return /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Form, { form, children: /* @__PURE__ */ jsxRuntime.jsxs(KeyboundForm, { className: "flex flex-1 flex-col", children: [
    /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Body, {}),
    /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", children: t("draftOrdersPlugin.general.cancel") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", type: "submit", children: t("draftOrdersPlugin.general.save") })
    ] }) })
  ] }) });
};
const schema$3 = zod.z.object({
  email: zod.z.string().email()
});
const PROMOTION_QUERY_KEY = "promotions";
const promotionsQueryKeys = {
  list: (query2) => [
    PROMOTION_QUERY_KEY,
    query2 ? query2 : void 0
  ],
  detail: (id, query2) => [
    PROMOTION_QUERY_KEY,
    id,
    query2 ? query2 : void 0
  ]
};
const usePromotions = (query2, options) => {
  const { data, ...rest } = reactQuery.useQuery({
    queryKey: promotionsQueryKeys.list(query2),
    queryFn: async () => sdk.admin.promotion.list(query2),
    ...options
  });
  return { ...data, ...rest };
};
const Promotions = () => {
  const { t } = reactI18next.useTranslation();
  const { id } = reactRouterDom.useParams();
  const {
    order: preview,
    isError: isPreviewError,
    error: previewError
  } = useOrderPreview(id, void 0);
  useInitiateOrderEdit({ preview });
  const { onCancel } = useCancelOrderEdit({ preview });
  if (isPreviewError) {
    throw previewError;
  }
  const isReady = !!preview;
  return /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer, { onClose: onCancel, children: [
    /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Header, { children: /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.promotions.title") }) }) }),
    isReady && /* @__PURE__ */ jsxRuntime.jsx(PromotionForm, { preview })
  ] });
};
const PromotionForm = ({ preview }) => {
  const { t } = reactI18next.useTranslation();
  const { items, shipping_methods } = preview;
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [comboboxValue, setComboboxValue] = React.useState("");
  const { handleSuccess } = useRouteModal();
  const { mutateAsync: addPromotions, isPending: isAddingPromotions } = useDraftOrderAddPromotions(preview.id);
  const promoIds = getPromotionIds(items, shipping_methods);
  const { promotions, isPending, isError, error } = usePromotions(
    {
      id: promoIds
    },
    {
      enabled: !!promoIds.length
    }
  );
  const comboboxData = useComboboxData({
    queryKey: ["promotions", "combobox", promoIds],
    queryFn: async (params) => {
      return await sdk.admin.promotion.list({
        ...params,
        id: {
          $nin: promoIds
        }
      });
    },
    getOptions: (data) => {
      return data.promotions.map((promotion) => ({
        label: promotion.code,
        value: promotion.code
      }));
    }
  });
  const add = async (value) => {
    if (!value) {
      return;
    }
    addPromotions(
      {
        promo_codes: [value]
      },
      {
        onError: (e) => {
          ui.toast.error(e.message);
          comboboxData.onSearchValueChange("");
          setComboboxValue("");
        },
        onSuccess: () => {
          comboboxData.onSearchValueChange("");
          setComboboxValue("");
        }
      }
    );
  };
  const { mutateAsync: confirmOrderEdit } = useDraftOrderConfirmEdit(preview.id);
  const { mutateAsync: requestOrderEdit } = useOrderEditRequest(preview.id);
  const onSubmit = async () => {
    setIsSubmitting(true);
    let requestSucceeded = false;
    await requestOrderEdit(void 0, {
      onError: (e) => {
        ui.toast.error(e.message);
      },
      onSuccess: () => {
        requestSucceeded = true;
      }
    });
    if (!requestSucceeded) {
      setIsSubmitting(false);
      return;
    }
    await confirmOrderEdit(void 0, {
      onError: (e) => {
        ui.toast.error(e.message);
      },
      onSuccess: () => {
        handleSuccess();
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    });
  };
  if (isError) {
    throw error;
  }
  return /* @__PURE__ */ jsxRuntime.jsxs(KeyboundForm, { className: "flex flex-1 flex-col", onSubmit, children: [
    /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Body, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-4", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { size: "small", weight: "plus", htmlFor: "promotion-combobox", children: t("draftOrdersPlugin.promotions.apply") }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Hint, { id: "promotion-combobox-hint", children: t("draftOrdersPlugin.promotions.applyHint") })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          Combobox,
          {
            id: "promotion-combobox",
            "aria-describedby": "promotion-combobox-hint",
            isFetchingNextPage: comboboxData.isFetchingNextPage,
            fetchNextPage: comboboxData.fetchNextPage,
            options: comboboxData.options,
            onSearchValueChange: comboboxData.onSearchValueChange,
            searchValue: comboboxData.searchValue,
            disabled: comboboxData.disabled || isAddingPromotions,
            onChange: add,
            value: comboboxValue
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-2", children: promotions?.map((promotion) => /* @__PURE__ */ jsxRuntime.jsx(
        PromotionItem,
        {
          promotion,
          orderId: preview.id,
          isLoading: isPending
        },
        promotion.id
      )) })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", children: t("draftOrdersPlugin.general.cancel") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          size: "small",
          type: "submit",
          isLoading: isSubmitting || isAddingPromotions,
          children: t("draftOrdersPlugin.general.save")
        }
      )
    ] }) })
  ] });
};
const PromotionItem = ({
  promotion,
  orderId,
  isLoading
}) => {
  const { t } = reactI18next.useTranslation();
  const { mutateAsync: removePromotions, isPending } = useDraftOrderRemovePromotions(orderId);
  const onRemove = async () => {
    removePromotions(
      {
        promo_codes: [promotion.code]
      },
      {
        onError: (e) => {
          ui.toast.error(e.message);
        }
      }
    );
  };
  const displayValue = getDisplayValue(promotion);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "div",
    {
      className: ui.clx(
        "bg-ui-bg-component shadow-elevation-card-rest flex items-center justify-between rounded-lg px-3 py-2",
        {
          "animate-pulse": isLoading
        }
      ),
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: promotion.code }),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-ui-fg-subtle flex items-center gap-1.5", children: [
            displayValue && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: displayValue }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", children: "·" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", leading: "compact", className: "capitalize", children: getAllocationLabel(promotion.application_method?.allocation, t) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(
          ui.IconButton,
          {
            size: "small",
            type: "button",
            variant: "transparent",
            onClick: onRemove,
            isLoading: isPending || isLoading,
            children: /* @__PURE__ */ jsxRuntime.jsx(icons.XMark, {})
          }
        )
      ]
    },
    promotion.id
  );
};
const ALLOCATION_KEYS = {
  each: "draftOrdersPlugin.promotions.allocation.each",
  across: "draftOrdersPlugin.promotions.allocation.across",
  once: "draftOrdersPlugin.promotions.allocation.once"
};
function getAllocationLabel(allocation, t) {
  if (!allocation) {
    return allocation;
  }
  const key = ALLOCATION_KEYS[allocation];
  return key ? t(key) : allocation;
}
function getDisplayValue(promotion) {
  const value = promotion.application_method?.value;
  if (!value) {
    return null;
  }
  if (promotion.application_method?.type === "fixed") {
    const currency = promotion.application_method?.currency_code;
    if (!currency) {
      return null;
    }
    return getLocaleAmount(value, currency);
  } else if (promotion.application_method?.type === "percentage") {
    return formatPercentage(value);
  }
  return null;
}
const formatter = new Intl.NumberFormat([], {
  style: "percent",
  minimumFractionDigits: 2
});
const formatPercentage = (value, isPercentageValue = false) => {
  let val = value || 0;
  if (!isPercentageValue) {
    val = val / 100;
  }
  return formatter.format(val);
};
function getPromotionIds(items, shippingMethods) {
  const promotionIds = /* @__PURE__ */ new Set();
  for (const item of items) {
    if (item.adjustments) {
      for (const adjustment of item.adjustments) {
        if (adjustment.promotion_id) {
          promotionIds.add(adjustment.promotion_id);
        }
      }
    }
  }
  for (const shippingMethod of shippingMethods) {
    if (shippingMethod.adjustments) {
      for (const adjustment of shippingMethod.adjustments) {
        if (adjustment.promotion_id) {
          promotionIds.add(adjustment.promotion_id);
        }
      }
    }
  }
  return Array.from(promotionIds);
}
const SalesChannel = () => {
  const { t } = reactI18next.useTranslation();
  const { id } = reactRouterDom.useParams();
  const { draft_order, isPending, isError, error } = useDraftOrder(
    id,
    {
      fields: "+sales_channel_id"
    },
    {
      enabled: !!id
    }
  );
  if (isError) {
    throw error;
  }
  const ISrEADY = !!draft_order && !isPending;
  return /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer.Header, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.salesChannel.title") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.salesChannel.description") }) })
    ] }),
    ISrEADY && /* @__PURE__ */ jsxRuntime.jsx(SalesChannelForm, { order: draft_order })
  ] });
};
const SalesChannelForm = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  const zodErrorMap = useZodErrorMap();
  const form = reactHookForm.useForm({
    defaultValues: {
      sales_channel_id: order.sales_channel_id || ""
    },
    resolver: zod$1.zodResolver(schema$2, { error: zodErrorMap })
  });
  const { mutateAsync, isPending } = useUpdateDraftOrder(order.id);
  const { handleSuccess } = useRouteModal();
  const onSubmit = form.handleSubmit(async (data) => {
    await mutateAsync(
      {
        sales_channel_id: data.sales_channel_id
      },
      {
        onSuccess: () => {
          ui.toast.success(t("draftOrdersPlugin.salesChannel.success"));
          handleSuccess();
        },
        onError: (error) => {
          ui.toast.error(error.message);
        }
      }
    );
  });
  return /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Form, { form, children: /* @__PURE__ */ jsxRuntime.jsxs(
    KeyboundForm,
    {
      className: "flex flex-1 flex-col overflow-hidden",
      onSubmit,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Body, { className: "flex flex-col gap-y-6 overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsx(SalesChannelField, { control: form.control, order }) }),
        /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", children: t("draftOrdersPlugin.general.cancel") }) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", type: "submit", isLoading: isPending, children: t("draftOrdersPlugin.general.save") })
        ] }) })
      ]
    }
  ) });
};
const SalesChannelField = ({ control, order }) => {
  const { t } = reactI18next.useTranslation();
  const salesChannels = useComboboxData({
    queryFn: async (params) => {
      return await sdk.admin.salesChannel.list(params);
    },
    queryKey: ["sales-channels"],
    getOptions: (data) => {
      return data.sales_channels.map((salesChannel) => ({
        label: salesChannel.name,
        value: salesChannel.id
      }));
    },
    defaultValue: order.sales_channel_id || void 0
  });
  return /* @__PURE__ */ jsxRuntime.jsx(
    Form$2.Field,
    {
      control,
      name: "sales_channel_id",
      render: ({ field }) => {
        return /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.salesChannel") }),
          /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
            Combobox,
            {
              options: salesChannels.options,
              fetchNextPage: salesChannels.fetchNextPage,
              isFetchingNextPage: salesChannels.isFetchingNextPage,
              searchValue: salesChannels.searchValue,
              onSearchValueChange: salesChannels.onSearchValueChange,
              placeholder: t("draftOrdersPlugin.salesChannel.placeholder"),
              ...field
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
        ] });
      }
    }
  );
};
const schema$2 = zod.z.object({
  sales_channel_id: zod.z.string().min(1)
});
const ShippingAddress = () => {
  const { t } = reactI18next.useTranslation();
  const { id } = reactRouterDom.useParams();
  const { order, isPending, isError, error } = useOrder(id, {
    fields: "+shipping_address"
  });
  if (isError) {
    throw error;
  }
  const isReady = !isPending && !!order;
  return /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer.Header, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.shippingAddress.title") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.shippingAddress.description") }) })
    ] }),
    isReady && /* @__PURE__ */ jsxRuntime.jsx(ShippingAddressForm, { order })
  ] });
};
const ShippingAddressForm = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  const zodErrorMap = useZodErrorMap();
  const form = reactHookForm.useForm({
    defaultValues: {
      first_name: order.shipping_address?.first_name ?? "",
      last_name: order.shipping_address?.last_name ?? "",
      company: order.shipping_address?.company ?? "",
      address_1: order.shipping_address?.address_1 ?? "",
      address_2: order.shipping_address?.address_2 ?? "",
      city: order.shipping_address?.city ?? "",
      province: order.shipping_address?.province ?? "",
      country_code: order.shipping_address?.country_code ?? "",
      postal_code: order.shipping_address?.postal_code ?? "",
      phone: order.shipping_address?.phone ?? ""
    },
    resolver: zod$1.zodResolver(schema$1, { error: zodErrorMap })
  });
  const { mutateAsync, isPending } = useUpdateDraftOrder(order.id);
  const { handleSuccess } = useRouteModal();
  const onSubmit = form.handleSubmit(async (data) => {
    await mutateAsync(
      {
        shipping_address: {
          first_name: data.first_name,
          last_name: data.last_name,
          company: data.company,
          address_1: data.address_1,
          address_2: data.address_2,
          city: data.city,
          province: data.province,
          country_code: data.country_code,
          postal_code: data.postal_code,
          phone: data.phone
        }
      },
      {
        onSuccess: () => {
          handleSuccess();
        },
        onError: (error) => {
          ui.toast.error(error.message);
        }
      }
    );
  });
  return /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Form, { form, children: /* @__PURE__ */ jsxRuntime.jsxs(
    KeyboundForm,
    {
      className: "flex flex-1 flex-col overflow-hidden",
      onSubmit,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Body, { className: "flex flex-col gap-y-6 overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-4", children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "country_code",
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.country") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(CountrySelect, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Form$2.Field,
              {
                control: form.control,
                name: "first_name",
                render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.firstName") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Form$2.Field,
              {
                control: form.control,
                name: "last_name",
                render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.lastName") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "company",
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, children: t("draftOrdersPlugin.fields.company") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "address_1",
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.address") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "address_2",
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, children: t("draftOrdersPlugin.fields.address2") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              Form$2.Field,
              {
                control: form.control,
                name: "postal_code",
                render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.postalCode") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] })
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              Form$2.Field,
              {
                control: form.control,
                name: "city",
                render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.fields.city") }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                  /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "province",
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, children: t("draftOrdersPlugin.fields.province") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            Form$2.Field,
            {
              control: form.control,
              name: "phone",
              render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { children: [
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, children: t("draftOrdersPlugin.fields.phone") }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Input, { ...field }) }),
                /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
              ] })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-end gap-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", children: t("draftOrdersPlugin.general.cancel") }) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", type: "submit", isLoading: isPending, children: t("draftOrdersPlugin.general.save") })
        ] }) })
      ]
    }
  ) });
};
const schema$1 = addressSchema;
const STACKED_FOCUS_MODAL_ID = "shipping-form";
const Shipping = () => {
  const { t } = reactI18next.useTranslation();
  const { id } = reactRouterDom.useParams();
  const { order, isPending, isError, error } = useOrder(id, {
    fields: "+items.*,+items.variant.*,+items.variant.product.*,+items.variant.product.shipping_profile.*,+currency_code"
  });
  const {
    order: preview,
    isPending: isPreviewPending,
    isError: isPreviewError,
    error: previewError
  } = useOrderPreview(id);
  useInitiateOrderEdit({ preview });
  const { onCancel } = useCancelOrderEdit({ preview });
  if (isError) {
    throw error;
  }
  if (isPreviewError) {
    throw previewError;
  }
  const orderHasItems = (order?.items?.length || 0) > 0;
  const isReady = preview && !isPreviewPending && order && !isPending;
  return /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal, { onClose: onCancel, children: !orderHasItems ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex h-full flex-col overflow-hidden ", children: [
    /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Header, {}),
    /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Body, { className: "flex flex-1 flex-col overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-1 flex-col items-center overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full max-w-[720px] flex-col gap-y-6 px-6 py-16", children: [
      /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.shipping.title") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: t("draftOrdersPlugin.shipping.noItems") }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Footer, { children: /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", type: "button", children: t("draftOrdersPlugin.general.cancel") }) }) })
  ] }) : isReady ? /* @__PURE__ */ jsxRuntime.jsx(ShippingForm, { preview, order }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.shipping.editTitle") }) }),
    /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.general.loading") }) })
  ] }) });
};
const ShippingForm = ({ preview, order }) => {
  const { t } = reactI18next.useTranslation();
  const tp = usePlural();
  const { setIsOpen } = useStackedModal();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [data, setData] = React.useState(null);
  const appliedShippingOptionIds = preview.shipping_methods?.map((method) => method.shipping_option_id).filter(Boolean);
  const { shipping_options } = useShippingOptions(
    {
      id: appliedShippingOptionIds,
      fields: "+service_zone.*,+service_zone.fulfillment_set.*,+service_zone.fulfillment_set.location.*"
    },
    {
      enabled: appliedShippingOptionIds.length > 0
    }
  );
  const uniqueShippingProfiles = React.useMemo(() => {
    const profiles = /* @__PURE__ */ new Map();
    getUniqueShippingProfiles(order.items).forEach((profile) => {
      profiles.set(profile.id, profile);
    });
    shipping_options?.forEach((option) => {
      profiles.set(option.shipping_profile_id, option.shipping_profile);
    });
    return Array.from(profiles.values());
  }, [order.items, shipping_options]);
  const { handleSuccess } = useRouteModal();
  const { mutateAsync: confirmOrderEdit } = useDraftOrderConfirmEdit(preview.id);
  const { mutateAsync: requestOrderEdit } = useDraftOrderRequestEdit(preview.id);
  const { mutateAsync: removeShippingMethod } = useDraftOrderRemoveShippingMethod(preview.id);
  const { mutateAsync: removeActionShippingMethod } = useDraftOrderRemoveActionShippingMethod(preview.id);
  const onSubmit = async () => {
    setIsSubmitting(true);
    let requestSucceeded = false;
    await requestOrderEdit(void 0, {
      onError: (e) => {
        ui.toast.error(
          t("draftOrdersPlugin.orderEdit.requestFailed", { message: e.message })
        );
      },
      onSuccess: () => {
        requestSucceeded = true;
      }
    });
    if (!requestSucceeded) {
      setIsSubmitting(false);
      return;
    }
    await confirmOrderEdit(void 0, {
      onError: (e) => {
        ui.toast.error(
          t("draftOrdersPlugin.orderEdit.confirmFailed", { message: e.message })
        );
      },
      onSuccess: () => {
        handleSuccess();
      },
      onSettled: () => {
        setIsSubmitting(false);
      }
    });
  };
  const onKeydown = React.useCallback(
    (e) => {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        if (data || isSubmitting) {
          return;
        }
        onSubmit();
      }
    },
    [data, isSubmitting, onSubmit]
  );
  React.useEffect(() => {
    document.addEventListener("keydown", onKeydown);
    return () => {
      document.removeEventListener("keydown", onKeydown);
    };
  }, [onKeydown]);
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex h-full flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Header, {}),
    /* @__PURE__ */ jsxRuntime.jsxs(RouteFocusModal.Body, { className: "flex flex-1 flex-col overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-1 flex-col items-center overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full max-w-[720px] flex-col gap-y-6 px-6 py-16", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.shipping.title") }) }),
          /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: t("draftOrdersPlugin.shipping.description") }) })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
        /* @__PURE__ */ jsxRuntime.jsx(radixUi.Accordion.Root, { type: "multiple", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-subtle shadow-elevation-card-rest rounded-xl", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between px-4 py-2", children: [
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Text,
              {
                size: "xsmall",
                weight: "plus",
                className: "text-ui-fg-muted",
                children: t("draftOrdersPlugin.shipping.shippingProfile")
              }
            ),
            /* @__PURE__ */ jsxRuntime.jsx(
              ui.Text,
              {
                size: "xsmall",
                weight: "plus",
                className: "text-ui-fg-muted",
                children: t("draftOrdersPlugin.shipping.action")
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "px-[5px] pb-[5px]", children: uniqueShippingProfiles.map((profile) => {
            const items = getItemsWithShippingProfile(
              profile.id,
              order.items
            );
            const hasItems = items.length > 0;
            const shippingOption = shipping_options?.find(
              (option) => option.shipping_profile_id === profile.id
            );
            const shippingMethod = preview.shipping_methods.find(
              (method) => method.shipping_option_id === shippingOption?.id
            );
            const addShippingMethodAction = shippingMethod?.actions?.find(
              (action) => action.action === "SHIPPING_ADD"
            );
            return /* @__PURE__ */ jsxRuntime.jsxs(
              radixUi.Accordion.Item,
              {
                value: profile.id,
                className: "bg-ui-bg-base shadow-elevation-card-rest rounded-lg",
                children: [
                  /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-between gap-3 px-3 py-2", children: [
                    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full items-center gap-x-3 overflow-hidden", children: [
                      /* @__PURE__ */ jsxRuntime.jsx(radixUi.Accordion.Trigger, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
                        ui.IconButton,
                        {
                          size: "2xsmall",
                          variant: "transparent",
                          className: "group/trigger",
                          disabled: !hasItems,
                          children: /* @__PURE__ */ jsxRuntime.jsx(icons.TriangleRightMini, { className: "transition-transform group-data-[state=open]/trigger:rotate-90" })
                        }
                      ) }),
                      !shippingOption ? /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-3", children: [
                        /* @__PURE__ */ jsxRuntime.jsx("div", { className: "shadow-borders-base flex size-7 items-center justify-center rounded-md", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "bg-ui-bg-component-hover flex size-6 items-center justify-center rounded", children: /* @__PURE__ */ jsxRuntime.jsx(icons.Shopping, { className: "text-ui-fg-subtle" }) }) }),
                        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-1 flex-col", children: [
                          /* @__PURE__ */ jsxRuntime.jsx(
                            ui.Text,
                            {
                              size: "small",
                              weight: "plus",
                              leading: "compact",
                              children: profile.name
                            }
                          ),
                          /* @__PURE__ */ jsxRuntime.jsx(
                            ui.Text,
                            {
                              size: "small",
                              leading: "compact",
                              className: "text-ui-fg-subtle",
                              children: tp(
                                "draftOrdersPlugin.shipping.itemCount",
                                items.length
                              )
                            }
                          )
                        ] })
                      ] }) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full flex-1 items-center gap-[5px] overflow-hidden max-sm:flex-col max-sm:items-start", children: [
                        /* @__PURE__ */ jsxRuntime.jsx(
                          ui.Tooltip,
                          {
                            content: /* @__PURE__ */ jsxRuntime.jsx("ul", { children: items.map((item) => /* @__PURE__ */ jsxRuntime.jsx(
                              "li",
                              {
                                children: `${item.quantity}x ${item.variant?.product?.title} (${item.variant?.title})`
                              },
                              item.id
                            )) }),
                            children: /* @__PURE__ */ jsxRuntime.jsxs(
                              ui.Badge,
                              {
                                className: "flex cursor-default items-center gap-x-[3px] overflow-hidden",
                                size: "xsmall",
                                children: [
                                  /* @__PURE__ */ jsxRuntime.jsx(icons.Shopping, { className: "shrink-0" }),
                                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: tp(
                                    "draftOrdersPlugin.shipping.quantityBadge",
                                    items.length,
                                    {
                                      quantity: items.reduce(
                                        (acc, item) => acc + item.quantity,
                                        0
                                      )
                                    }
                                  ) })
                                ]
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ jsxRuntime.jsx(
                          ui.Tooltip,
                          {
                            content: shippingOption.service_zone?.fulfillment_set?.location?.name,
                            children: /* @__PURE__ */ jsxRuntime.jsxs(
                              ui.Badge,
                              {
                                className: "flex cursor-default items-center gap-x-[3px] overflow-hidden",
                                size: "xsmall",
                                children: [
                                  /* @__PURE__ */ jsxRuntime.jsx(icons.Buildings, { className: "shrink-0" }),
                                  /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: shippingOption.service_zone?.fulfillment_set?.location?.name })
                                ]
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ jsxRuntime.jsx(ui.Tooltip, { content: shippingOption.name, children: /* @__PURE__ */ jsxRuntime.jsxs(
                          ui.Badge,
                          {
                            className: "flex cursor-default items-center gap-x-[3px] overflow-hidden",
                            size: "xsmall",
                            children: [
                              /* @__PURE__ */ jsxRuntime.jsx(icons.TruckFast, { className: "shrink-0" }),
                              /* @__PURE__ */ jsxRuntime.jsx("span", { className: "truncate", children: shippingOption.name })
                            ]
                          }
                        ) })
                      ] })
                    ] }),
                    shippingOption ? /* @__PURE__ */ jsxRuntime.jsx(
                      ActionMenu,
                      {
                        groups: [
                          {
                            actions: [
                              hasItems ? {
                                label: t("draftOrdersPlugin.shipping.editOption"),
                                icon: /* @__PURE__ */ jsxRuntime.jsx(icons.Channels, {}),
                                onClick: () => {
                                  setIsOpen(
                                    STACKED_FOCUS_MODAL_ID,
                                    true
                                  );
                                  setData({
                                    shippingProfileId: profile.id,
                                    shippingOption,
                                    shippingMethod
                                  });
                                }
                              } : void 0,
                              {
                                label: t("draftOrdersPlugin.shipping.removeOption"),
                                icon: /* @__PURE__ */ jsxRuntime.jsx(icons.Trash, {}),
                                onClick: () => {
                                  if (shippingMethod) {
                                    if (addShippingMethodAction) {
                                      removeActionShippingMethod(
                                        addShippingMethodAction.id
                                      );
                                    } else {
                                      removeShippingMethod(
                                        shippingMethod.id
                                      );
                                    }
                                  }
                                }
                              }
                            ].filter(Boolean)
                          }
                        ]
                      }
                    ) : /* @__PURE__ */ jsxRuntime.jsx(
                      StackedModalTrigger,
                      {
                        shippingProfileId: profile.id,
                        shippingOption,
                        shippingMethod,
                        setData,
                        children: t("draftOrdersPlugin.shipping.addOption")
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntime.jsxs(radixUi.Accordion.Content, { children: [
                    /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
                    items.map((item, idx) => {
                      return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                        /* @__PURE__ */ jsxRuntime.jsxs(
                          "div",
                          {
                            className: "flex items-center gap-x-3 px-3",
                            children: [
                              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex h-[56px] w-5 flex-col items-center justify-center", children: /* @__PURE__ */ jsxRuntime.jsx(
                                ui.Divider,
                                {
                                  variant: "dashed",
                                  orientation: "vertical"
                                }
                              ) }),
                              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-3 py-2", children: [
                                /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex size-7 items-center justify-center tabular-nums", children: /* @__PURE__ */ jsxRuntime.jsxs(
                                  ui.Text,
                                  {
                                    size: "small",
                                    leading: "compact",
                                    className: "text-ui-fg-subtle",
                                    children: [
                                      item.quantity,
                                      "x"
                                    ]
                                  }
                                ) }),
                                /* @__PURE__ */ jsxRuntime.jsx(Thumbnail, { thumbnail: item.thumbnail }),
                                /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                                  /* @__PURE__ */ jsxRuntime.jsxs(
                                    ui.Text,
                                    {
                                      size: "small",
                                      leading: "compact",
                                      weight: "plus",
                                      children: [
                                        item.variant?.product?.title,
                                        " (",
                                        item.variant?.title,
                                        ")"
                                      ]
                                    }
                                  ),
                                  /* @__PURE__ */ jsxRuntime.jsx(
                                    ui.Text,
                                    {
                                      size: "small",
                                      leading: "compact",
                                      className: "text-ui-fg-subtle",
                                      children: item.variant?.options?.map((option) => option.value).join(" · ")
                                    }
                                  )
                                ] })
                              ] })
                            ]
                          },
                          item.id
                        ),
                        idx !== items.length - 1 && /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" })
                      ] }, item.id);
                    })
                  ] })
                ]
              },
              profile.id
            );
          }) })
        ] }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsx(
        StackedFocusModal,
        {
          id: STACKED_FOCUS_MODAL_ID,
          onOpenChangeCallback: (open) => {
            if (!open) {
              setData(null);
            }
            return open;
          },
          children: data && /* @__PURE__ */ jsxRuntime.jsx(ShippingProfileForm, { data, order, preview })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-end gap-x-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", type: "button", children: t("draftOrdersPlugin.general.cancel") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(
        ui.Button,
        {
          size: "small",
          type: "button",
          isLoading: isSubmitting,
          onClick: onSubmit,
          children: t("draftOrdersPlugin.general.save")
        }
      )
    ] }) })
  ] });
};
const StackedModalTrigger = ({
  shippingProfileId,
  shippingOption,
  shippingMethod,
  setData,
  children
}) => {
  const { setIsOpen, getIsOpen } = useStackedModal();
  const isOpen = getIsOpen(STACKED_FOCUS_MODAL_ID);
  const onToggle = () => {
    if (isOpen) {
      setIsOpen(STACKED_FOCUS_MODAL_ID, false);
      setData(null);
    } else {
      setIsOpen(STACKED_FOCUS_MODAL_ID, true);
      setData({
        shippingProfileId,
        shippingOption,
        shippingMethod
      });
    }
  };
  return /* @__PURE__ */ jsxRuntime.jsx(
    ui.Button,
    {
      size: "small",
      variant: "secondary",
      onClick: onToggle,
      className: "text-ui-fg-primary shrink-0",
      children
    }
  );
};
const ShippingProfileForm = ({
  data,
  order,
  preview
}) => {
  const { t } = reactI18next.useTranslation();
  const zodErrorMap = useZodErrorMap();
  const { setIsOpen } = useStackedModal();
  const form = reactHookForm.useForm({
    resolver: zod$1.zodResolver(shippingMethodSchema, { error: zodErrorMap }),
    defaultValues: {
      location_id: data.shippingOption?.service_zone?.fulfillment_set?.location?.id,
      shipping_option_id: data.shippingOption?.id,
      custom_amount: data.shippingMethod?.amount
    }
  });
  const { mutateAsync: addShippingMethod, isPending } = useDraftOrderAddShippingMethod(order.id);
  const {
    mutateAsync: updateShippingMethod,
    isPending: isUpdatingShippingMethod
  } = useDraftOrderUpdateShippingMethod(order.id);
  const onSubmit = form.handleSubmit(async (values) => {
    if (isEqual__default.default(values, form.formState.defaultValues)) {
      setIsOpen(STACKED_FOCUS_MODAL_ID, false);
      return;
    }
    if (data.shippingMethod) {
      await updateShippingMethod(
        {
          method_id: data.shippingMethod.id,
          shipping_option_id: values.shipping_option_id,
          custom_amount: values.custom_amount ? convertNumber(values.custom_amount) : void 0
        },
        {
          onError: (e) => {
            ui.toast.error(e.message);
          },
          onSuccess: () => {
            setIsOpen(STACKED_FOCUS_MODAL_ID, false);
          }
        }
      );
      return;
    }
    await addShippingMethod(
      {
        shipping_option_id: values.shipping_option_id,
        custom_amount: values.custom_amount ? convertNumber(values.custom_amount) : void 0
      },
      {
        onError: (e) => {
          ui.toast.error(e.message);
        },
        onSuccess: () => {
          setIsOpen(STACKED_FOCUS_MODAL_ID, false);
        }
      }
    );
  });
  return /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Content, { children: /* @__PURE__ */ jsxRuntime.jsx(Form$2, { ...form, children: /* @__PURE__ */ jsxRuntime.jsxs(
    KeyboundForm,
    {
      className: "flex h-full flex-col overflow-hidden",
      onSubmit,
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Header, {}),
        /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Body, { className: "flex flex-1 flex-col overflow-hidden", children: /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-1 flex-col items-center overflow-y-auto", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex w-full max-w-[720px] flex-col gap-y-6 px-6 py-16", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.shipping.title") }) }),
            /* @__PURE__ */ jsxRuntime.jsx(RouteFocusModal.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: t("draftOrdersPlugin.shipping.formDescription") }) })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            LocationField,
            {
              control: form.control,
              setValue: form.setValue
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ShippingOptionField,
            {
              shippingProfileId: data.shippingProfileId,
              preview,
              control: form.control
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            CustomAmountField,
            {
              control: form.control,
              currencyCode: order.currency_code
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Divider, { variant: "dashed" }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ItemsPreview,
            {
              order,
              shippingProfileId: data.shippingProfileId
            }
          )
        ] }) }) }),
        /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex justify-end gap-x-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(StackedFocusModal.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", type: "button", children: t("draftOrdersPlugin.general.cancel") }) }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ui.Button,
            {
              size: "small",
              type: "submit",
              isLoading: isPending || isUpdatingShippingMethod,
              children: data.shippingMethod ? t("draftOrdersPlugin.general.update") : t("draftOrdersPlugin.general.add")
            }
          )
        ] }) })
      ]
    }
  ) }) });
};
const shippingMethodSchema = zod.z.object({
  location_id: zod.z.string(),
  shipping_option_id: zod.z.string(),
  custom_amount: zod.z.union([zod.z.number(), zod.z.string()]).optional()
});
const ItemsPreview = ({ order, shippingProfileId }) => {
  const { t } = reactI18next.useTranslation();
  const matches = order.items.filter(
    (item) => item.variant?.product?.shipping_profile?.id === shippingProfileId
  );
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col gap-y-6", children: [
    /* @__PURE__ */ jsxRuntime.jsx("div", { className: "grid grid-cols-2 items-center gap-3", children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: t("draftOrdersPlugin.shipping.itemsToShip") }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: t("draftOrdersPlugin.shipping.itemsToShipHint") })
    ] }) }),
    /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-subtle shadow-elevation-card-rest rounded-xl", children: [
      /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-ui-fg-muted grid grid-cols-2 gap-3 px-4 py-2", children: [
        /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: t("draftOrdersPlugin.items.columns.item") }) }),
        /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", children: t("draftOrdersPlugin.items.columns.quantity") }) })
      ] }),
      /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex flex-col gap-y-1.5 px-[5px] pb-[5px]", children: matches.length > 0 ? matches?.map((item) => /* @__PURE__ */ jsxRuntime.jsxs(
        "div",
        {
          className: "bg-ui-bg-base shadow-elevation-card-rest grid grid-cols-2 items-center gap-3 rounded-lg px-4 py-2",
          children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-3", children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                Thumbnail,
                {
                  thumbnail: item.thumbnail,
                  alt: item.product_title ?? void 0
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center gap-x-1", children: [
                  /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: item.product_title }),
                  /* @__PURE__ */ jsxRuntime.jsxs(
                    ui.Text,
                    {
                      size: "small",
                      leading: "compact",
                      className: "text-ui-fg-subtle",
                      children: [
                        "(",
                        item.variant_title,
                        ")"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx(
                  ui.Text,
                  {
                    size: "small",
                    leading: "compact",
                    className: "text-ui-fg-subtle",
                    children: item.variant_sku
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(
              ui.Text,
              {
                size: "small",
                leading: "compact",
                className: "text-ui-fg-subtle",
                children: [
                  item.quantity,
                  "x"
                ]
              }
            )
          ]
        },
        item.id
      )) : /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-base shadow-elevation-card-rest flex flex-col items-center justify-center gap-1 gap-x-3 rounded-lg p-4", children: [
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", weight: "plus", leading: "compact", children: t("draftOrdersPlugin.items.noResults.title") }),
        /* @__PURE__ */ jsxRuntime.jsx(ui.Text, { size: "small", className: "text-ui-fg-subtle", children: t("draftOrdersPlugin.items.noResults.description", { query }) })
      ] }) })
    ] })
  ] });
};
const LocationField = ({ control, setValue }) => {
  const { t } = reactI18next.useTranslation();
  const locations = useComboboxData({
    queryKey: ["locations"],
    queryFn: async (params) => {
      return await sdk.admin.stockLocation.list(params);
    },
    getOptions: (data) => {
      return data.stock_locations.map((location) => ({
        label: location.name,
        value: location.id
      }));
    }
  });
  return /* @__PURE__ */ jsxRuntime.jsx(
    Form$2.Field,
    {
      control,
      name: "location_id",
      render: ({ field: { onChange, ...field } }) => {
        return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-x-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.shipping.location") }),
            /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.shipping.locationHint") })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
            Combobox,
            {
              options: locations.options,
              fetchNextPage: locations.fetchNextPage,
              isFetchingNextPage: locations.isFetchingNextPage,
              searchValue: locations.searchValue,
              onSearchValueChange: locations.onSearchValueChange,
              placeholder: t("draftOrdersPlugin.shipping.locationPlaceholder"),
              onChange: (value) => {
                setValue("shipping_option_id", "", {
                  shouldDirty: true,
                  shouldTouch: true
                });
                onChange(value);
              },
              ...field
            }
          ) })
        ] }) });
      }
    }
  );
};
const ShippingOptionField = ({
  shippingProfileId,
  preview,
  control
}) => {
  const { t } = reactI18next.useTranslation();
  const locationId = reactHookForm.useWatch({ control, name: "location_id" });
  const shippingOptions = useComboboxData({
    queryKey: ["shipping_options", locationId, shippingProfileId],
    queryFn: async (params) => {
      return await sdk.admin.shippingOption.list({
        ...params,
        stock_location_id: locationId,
        shipping_profile_id: shippingProfileId
      });
    },
    getOptions: (data) => {
      return data.shipping_options.map((option) => {
        if (option.rules?.find(
          (r) => r.attribute === "is_return" && r.value === "true"
        )) {
          return void 0;
        }
        return {
          label: option.name,
          value: option.id
        };
      }).filter(Boolean);
    },
    enabled: !!locationId && !!shippingProfileId,
    defaultValue: preview.shipping_methods[0]?.shipping_option_id || void 0
  });
  const tooltipContent = !locationId && !shippingProfileId ? t("draftOrdersPlugin.shipping.chooseLocationAndProfile") : !locationId ? t("draftOrdersPlugin.shipping.chooseLocation") : t("draftOrdersPlugin.shipping.chooseProfile");
  return /* @__PURE__ */ jsxRuntime.jsx(
    Form$2.Field,
    {
      control,
      name: "shipping_option_id",
      render: ({ field }) => {
        return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-x-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.shipping.shippingOption") }),
            /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.shipping.shippingOptionHint") })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            ConditionalTooltip,
            {
              content: tooltipContent,
              showTooltip: !locationId || !shippingProfileId,
              children: /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
                Combobox,
                {
                  options: shippingOptions.options,
                  fetchNextPage: shippingOptions.fetchNextPage,
                  isFetchingNextPage: shippingOptions.isFetchingNextPage,
                  searchValue: shippingOptions.searchValue,
                  onSearchValueChange: shippingOptions.onSearchValueChange,
                  placeholder: t("draftOrdersPlugin.shipping.shippingOptionPlaceholder"),
                  ...field,
                  disabled: !locationId || !shippingProfileId
                }
              ) }) })
            }
          )
        ] }) });
      }
    }
  );
};
const CustomAmountField = ({
  control,
  currencyCode
}) => {
  const { t } = reactI18next.useTranslation();
  return /* @__PURE__ */ jsxRuntime.jsx(
    Form$2.Field,
    {
      control,
      name: "custom_amount",
      render: ({ field: { onChange, ...field } }) => {
        return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "grid grid-cols-2 gap-x-3", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { optional: true, children: t("draftOrdersPlugin.shipping.customAmount") }),
            /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.shipping.customAmountHint") })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
            ui.CurrencyInput,
            {
              ...field,
              onValueChange: (value) => onChange(value),
              symbol: getNativeSymbol(currencyCode),
              code: currencyCode
            }
          ) })
        ] });
      }
    }
  );
};
const TransferOwnership = () => {
  const { t } = reactI18next.useTranslation();
  const { id } = reactRouterDom.useParams();
  const { draft_order, isPending, isError, error } = useDraftOrder(id, {
    fields: "id,customer_id,customer.*"
  });
  if (isError) {
    throw error;
  }
  const isReady = !isPending && !!draft_order;
  return /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer.Header, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.transferOwnership.title") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.transferOwnership.description") }) })
    ] }),
    isReady && /* @__PURE__ */ jsxRuntime.jsx(TransferOwnershipForm, { order: draft_order })
  ] });
};
const TransferOwnershipForm = ({ order }) => {
  const { t } = reactI18next.useTranslation();
  const zodErrorMap = useZodErrorMap();
  const form = reactHookForm.useForm({
    defaultValues: {
      customer_id: order.customer_id || ""
    },
    resolver: zod$1.zodResolver(schema, { error: zodErrorMap })
  });
  const { mutateAsync, isPending } = useUpdateDraftOrder(order.id);
  const { handleSuccess } = useRouteModal();
  const name = [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(" ");
  const currentCustomer = order.customer ? {
    label: name ? `${name} (${order.customer.email})` : order.customer.email,
    value: order.customer.id
  } : null;
  const onSubmit = form.handleSubmit(async (data) => {
    await mutateAsync(
      { customer_id: data.customer_id },
      {
        onSuccess: () => {
          ui.toast.success(t("draftOrdersPlugin.transferOwnership.success"));
          handleSuccess();
        },
        onError: (error) => {
          ui.toast.error(error.message);
        }
      }
    );
  });
  return /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Form, { form, children: /* @__PURE__ */ jsxRuntime.jsxs(
    KeyboundForm,
    {
      className: "flex flex-1 flex-col overflow-hidden",
      onSubmit,
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer.Body, { className: "flex flex-col gap-y-6 overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { className: "flex items-center justify-center bg-ui-bg-component rounded-md border", children: /* @__PURE__ */ jsxRuntime.jsx(Illustration, {}) }),
          currentCustomer && /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col space-y-3", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Label, { size: "small", weight: "plus", htmlFor: "current-customer", children: t("draftOrdersPlugin.transferOwnership.currentOwner") }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Hint, { children: t("draftOrdersPlugin.transferOwnership.currentOwnerHint") })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs(ui.Select, { disabled: true, value: currentCustomer.value, children: [
              /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Trigger, { id: "current-customer", children: /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Value, {}) }),
              /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Content, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Select.Item, { value: currentCustomer.value, children: currentCustomer.label }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            CustomerField,
            {
              control: form.control,
              currentCustomerId: order.customer_id
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-x-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { variant: "secondary", size: "small", children: t("draftOrdersPlugin.general.cancel") }) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", type: "submit", isLoading: isPending, children: t("draftOrdersPlugin.general.save") })
        ] }) })
      ]
    }
  ) });
};
const CustomerField = ({ control, currentCustomerId }) => {
  const { t } = reactI18next.useTranslation();
  const customers = useComboboxData({
    queryFn: async (params) => {
      return await sdk.admin.customer.list({
        ...params,
        id: currentCustomerId ? { $nin: [currentCustomerId] } : void 0
      });
    },
    queryKey: ["customers"],
    getOptions: (data) => {
      return data.customers.map((customer) => {
        const name = [customer.first_name, customer.last_name].filter(Boolean).join(" ");
        return {
          label: name ? `${name} (${customer.email})` : customer.email,
          value: customer.id
        };
      });
    }
  });
  return /* @__PURE__ */ jsxRuntime.jsx(
    Form$2.Field,
    {
      name: "customer_id",
      control,
      render: ({ field }) => /* @__PURE__ */ jsxRuntime.jsxs(Form$2.Item, { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-col", children: [
          /* @__PURE__ */ jsxRuntime.jsx(Form$2.Label, { children: t("draftOrdersPlugin.transferOwnership.newCustomer") }),
          /* @__PURE__ */ jsxRuntime.jsx(Form$2.Hint, { children: t("draftOrdersPlugin.transferOwnership.newCustomerHint") })
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
          Combobox,
          {
            options: customers.options,
            fetchNextPage: customers.fetchNextPage,
            isFetchingNextPage: customers.isFetchingNextPage,
            searchValue: customers.searchValue,
            onSearchValueChange: customers.onSearchValueChange,
            placeholder: t("draftOrdersPlugin.transferOwnership.placeholder"),
            ...field
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx(Form$2.ErrorMessage, {})
      ] })
    }
  );
};
const Illustration = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs(
    "svg",
    {
      width: "280",
      height: "180",
      viewBox: "0 0 280 180",
      fill: "none",
      xmlns: "http://www.w3.org/2000/svg",
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          "rect",
          {
            x: "0.00428286",
            y: "-0.742904",
            width: "33.5",
            height: "65.5",
            rx: "6.75",
            transform: "matrix(0.865865 0.500278 -0.871576 0.490261 189.756 88.438)",
            fill: "#D4D4D8",
            stroke: "#52525B",
            strokeWidth: "1.5"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "rect",
          {
            x: "0.00428286",
            y: "-0.742904",
            width: "33.5",
            height: "65.5",
            rx: "6.75",
            transform: "matrix(0.865865 0.500278 -0.871576 0.490261 189.756 85.4381)",
            fill: "white",
            stroke: "#52525B",
            strokeWidth: "1.5"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            d: "M180.579 107.142L179.126 107.959",
            stroke: "#52525B",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            opacity: "0.88",
            d: "M182.305 109.546L180.257 109.534",
            stroke: "#52525B",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            opacity: "0.75",
            d: "M180.551 111.93L179.108 111.096",
            stroke: "#52525B",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            opacity: "0.63",
            d: "M176.347 112.897L176.354 111.73",
            stroke: "#52525B",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            opacity: "0.5",
            d: "M172.153 111.881L173.606 111.064",
            stroke: "#52525B",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            opacity: "0.38",
            d: "M170.428 109.478L172.476 109.489",
            stroke: "#52525B",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            opacity: "0.25",
            d: "M172.181 107.094L173.624 107.928",
            stroke: "#52525B",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            opacity: "0.13",
            d: "M176.386 106.126L176.379 107.294",
            stroke: "#52525B",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "rect",
          {
            width: "12",
            height: "3",
            rx: "1.5",
            transform: "matrix(0.865865 0.500278 -0.871576 0.490261 196.447 92.2925)",
            fill: "#D4D4D8"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "rect",
          {
            x: "0.00428286",
            y: "-0.742904",
            width: "33.5",
            height: "65.5",
            rx: "6.75",
            transform: "matrix(0.865865 0.500278 -0.871576 0.490261 117.023 46.4147)",
            fill: "#D4D4D8",
            stroke: "#52525B",
            strokeWidth: "1.5"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "rect",
          {
            x: "0.00428286",
            y: "-0.742904",
            width: "33.5",
            height: "65.5",
            rx: "6.75",
            transform: "matrix(0.865865 0.500278 -0.871576 0.490261 117.023 43.4147)",
            fill: "white",
            stroke: "#52525B",
            strokeWidth: "1.5"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "rect",
          {
            width: "12",
            height: "3",
            rx: "1.5",
            transform: "matrix(0.865865 0.500278 -0.871576 0.490261 123.714 50.2691)",
            fill: "#D4D4D8"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "rect",
          {
            width: "17",
            height: "3",
            rx: "1.5",
            transform: "matrix(0.865865 0.500278 -0.871576 0.490261 97.5557 66.958)",
            fill: "#D4D4D8"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "rect",
          {
            width: "12",
            height: "3",
            rx: "1.5",
            transform: "matrix(0.865865 0.500278 -0.871576 0.490261 93.1978 69.4093)",
            fill: "#D4D4D8"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            d: "M92.3603 63.9563C90.9277 63.1286 88.59 63.1152 87.148 63.9263C85.7059 64.7374 85.6983 66.0702 87.1308 66.8979C88.5634 67.7256 90.9011 67.7391 92.3432 66.928C93.7852 66.1168 93.7929 64.784 92.3603 63.9563ZM88.4382 66.1625C87.7221 65.7488 87.726 65.0822 88.4468 64.6767C89.1676 64.2713 90.3369 64.278 91.0529 64.6917C91.769 65.1055 91.7652 65.7721 91.0444 66.1775C90.3236 66.583 89.1543 66.5762 88.4382 66.1625Z",
            fill: "#A1A1AA"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "rect",
          {
            width: "17",
            height: "3",
            rx: "1.5",
            transform: "matrix(0.865865 0.500278 -0.871576 0.490261 109.758 60.0944)",
            fill: "#A1A1AA"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "rect",
          {
            width: "12",
            height: "3",
            rx: "1.5",
            transform: "matrix(0.865865 0.500278 -0.871576 0.490261 105.4 62.5457)",
            fill: "#A1A1AA"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            d: "M104.562 57.0927C103.13 56.265 100.792 56.2515 99.3501 57.0626C97.9081 57.8738 97.9004 59.2065 99.333 60.0343C100.766 60.862 103.103 60.8754 104.545 60.0643C105.987 59.2532 105.995 57.9204 104.562 57.0927ZM103.858 58.8972L100.815 59.1265C100.683 59.1367 100.55 59.1134 100.449 59.063C100.44 59.0585 100.432 59.0545 100.425 59.05C100.339 59.0005 100.29 58.9336 100.291 58.8637L100.294 58.1201C100.294 57.9752 100.501 57.8585 100.756 57.86C101.01 57.8615 101.217 57.98 101.216 58.1256L101.214 58.5669L103.732 58.3769C103.984 58.3578 104.217 58.4584 104.251 58.603C104.286 58.7468 104.11 58.8788 103.858 58.8977L103.858 58.8972Z",
            fill: "#52525B"
          }
        ),
        /* @__PURE__ */ jsxRuntime.jsx("g", { clipPath: "url(#clip0_20915_38670)", children: /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            d: "M133.106 81.8022L140.49 81.8447L140.515 77.6349",
            stroke: "#A1A1AA",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx("g", { clipPath: "url(#clip1_20915_38670)", children: /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            d: "M143.496 87.8055L150.881 87.8481L150.905 83.6383",
            stroke: "#A1A1AA",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx("g", { clipPath: "url(#clip2_20915_38670)", children: /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            d: "M153.887 93.8088L161.271 93.8514L161.295 89.6416",
            stroke: "#A1A1AA",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx("g", { clipPath: "url(#clip3_20915_38670)", children: /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            d: "M126.114 89.1912L118.729 89.1486L118.705 93.3584",
            stroke: "#A1A1AA",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx("g", { clipPath: "url(#clip4_20915_38670)", children: /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            d: "M136.504 95.1945L129.12 95.1519L129.095 99.3617",
            stroke: "#A1A1AA",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsx("g", { clipPath: "url(#clip5_20915_38670)", children: /* @__PURE__ */ jsxRuntime.jsx(
          "path",
          {
            d: "M146.894 101.198L139.51 101.155L139.486 105.365",
            stroke: "#A1A1AA",
            strokeWidth: "1.5",
            strokeLinecap: "round",
            strokeLinejoin: "round"
          }
        ) }),
        /* @__PURE__ */ jsxRuntime.jsxs("defs", { children: [
          /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: "clip0_20915_38670", children: /* @__PURE__ */ jsxRuntime.jsx(
            "rect",
            {
              width: "12",
              height: "12",
              fill: "white",
              transform: "matrix(0.865865 0.500278 -0.871576 0.490261 138.36 74.6508)"
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: "clip1_20915_38670", children: /* @__PURE__ */ jsxRuntime.jsx(
            "rect",
            {
              width: "12",
              height: "12",
              fill: "white",
              transform: "matrix(0.865865 0.500278 -0.871576 0.490261 148.75 80.6541)"
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: "clip2_20915_38670", children: /* @__PURE__ */ jsxRuntime.jsx(
            "rect",
            {
              width: "12",
              height: "12",
              fill: "white",
              transform: "matrix(0.865865 0.500278 -0.871576 0.490261 159.141 86.6575)"
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: "clip3_20915_38670", children: /* @__PURE__ */ jsxRuntime.jsx(
            "rect",
            {
              width: "12",
              height: "12",
              fill: "white",
              transform: "matrix(0.865865 0.500278 -0.871576 0.490261 120.928 84.4561)"
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: "clip4_20915_38670", children: /* @__PURE__ */ jsxRuntime.jsx(
            "rect",
            {
              width: "12",
              height: "12",
              fill: "white",
              transform: "matrix(0.865865 0.500278 -0.871576 0.490261 131.318 90.4594)"
            }
          ) }),
          /* @__PURE__ */ jsxRuntime.jsx("clipPath", { id: "clip5_20915_38670", children: /* @__PURE__ */ jsxRuntime.jsx(
            "rect",
            {
              width: "12",
              height: "12",
              fill: "white",
              transform: "matrix(0.865865 0.500278 -0.871576 0.490261 141.709 96.4627)"
            }
          ) })
        ] })
      ]
    }
  );
};
const schema = zod.z.object({
  customer_id: zod.z.string().min(1)
});
const InlineTip = React.forwardRef(
  ({ variant = "tip", label, className, children, ...props }, ref) => {
    const { t } = reactI18next.useTranslation();
    const labelValue = label || (variant === "warning" ? t("draftOrdersPlugin.general.warning") : t("draftOrdersPlugin.general.tip"));
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        ref,
        className: ui.clx(
          "bg-ui-bg-component txt-small text-ui-fg-subtle grid grid-cols-[4px_1fr] items-start gap-3 rounded-lg border p-3",
          className
        ),
        ...props,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            "div",
            {
              role: "presentation",
              className: ui.clx("w-4px bg-ui-tag-neutral-icon h-full rounded-full", {
                "bg-ui-tag-orange-icon": variant === "warning"
              })
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "text-pretty", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("strong", { className: "txt-small-plus text-ui-fg-base", children: [
              labelValue,
              ":"
            ] }),
            " ",
            children
          ] })
        ]
      }
    );
  }
);
InlineTip.displayName = "InlineTip";
const MetadataFieldSchema = zod.z.object({
  key: zod.z.string(),
  disabled: zod.z.boolean().optional(),
  value: zod.z.any()
});
const MetadataSchema = zod.z.object({
  metadata: zod.z.array(MetadataFieldSchema)
});
const Metadata = () => {
  const { t } = reactI18next.useTranslation();
  const { id } = reactRouterDom.useParams();
  const { order, isPending, isError, error } = useOrder(id, {
    fields: "metadata"
  });
  if (isError) {
    throw error;
  }
  const isReady = !isPending && !!order;
  return /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer.Header, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Title, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Heading, { children: t("draftOrdersPlugin.metadata.title") }) }),
      /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Description, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx("span", { className: "sr-only", children: t("draftOrdersPlugin.metadata.description") }) })
    ] }),
    !isReady ? /* @__PURE__ */ jsxRuntime.jsx(PlaceholderInner, {}) : /* @__PURE__ */ jsxRuntime.jsx(MetadataForm, { orderId: id, metadata: order?.metadata })
  ] });
};
const METADATA_KEY_LABEL_ID = "metadata-form-key-label";
const METADATA_VALUE_LABEL_ID = "metadata-form-value-label";
const MetadataForm = ({ orderId, metadata }) => {
  const { t } = reactI18next.useTranslation();
  const zodErrorMap = useZodErrorMap();
  const { handleSuccess } = useRouteModal();
  const hasUneditableRows = getHasUneditableRows(metadata);
  const { mutateAsync, isPending } = useUpdateDraftOrder(orderId);
  const form = reactHookForm.useForm({
    defaultValues: {
      metadata: getDefaultValues(metadata)
    },
    resolver: zod$1.zodResolver(MetadataSchema, { error: zodErrorMap })
  });
  const handleSubmit = form.handleSubmit(async (data) => {
    const parsedData = parseValues(data);
    await mutateAsync(
      {
        metadata: parsedData
      },
      {
        onSuccess: () => {
          ui.toast.success(t("draftOrdersPlugin.metadata.success"));
          handleSuccess();
        },
        onError: (error) => {
          ui.toast.error(error.message);
        }
      }
    );
  });
  const { fields, insert, remove } = reactHookForm.useFieldArray({
    control: form.control,
    name: "metadata"
  });
  function deleteRow(index) {
    remove(index);
    if (fields.length === 1) {
      insert(0, {
        key: "",
        value: "",
        disabled: false
      });
    }
  }
  function insertRow(index, position) {
    insert(index + (position === "above" ? 0 : 1), {
      key: "",
      value: "",
      disabled: false
    });
  }
  return /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Form, { form, children: /* @__PURE__ */ jsxRuntime.jsxs(
    KeyboundForm,
    {
      onSubmit: handleSubmit,
      className: "flex flex-1 flex-col overflow-hidden",
      children: [
        /* @__PURE__ */ jsxRuntime.jsxs(RouteDrawer.Body, { className: "flex flex-1 flex-col gap-y-8 overflow-y-auto", children: [
          /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-base shadow-elevation-card-rest grid grid-cols-1 divide-y rounded-lg", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "bg-ui-bg-subtle grid grid-cols-2 divide-x rounded-t-lg", children: [
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "txt-compact-small-plus text-ui-fg-subtle px-2 py-1.5", children: /* @__PURE__ */ jsxRuntime.jsx("label", { id: METADATA_KEY_LABEL_ID, children: t("draftOrdersPlugin.metadata.key") }) }),
              /* @__PURE__ */ jsxRuntime.jsx("div", { className: "txt-compact-small-plus text-ui-fg-subtle px-2 py-1.5", children: /* @__PURE__ */ jsxRuntime.jsx("label", { id: METADATA_VALUE_LABEL_ID, children: t("draftOrdersPlugin.metadata.value") }) })
            ] }),
            fields.map((field, index) => {
              const isDisabled = field.disabled || false;
              let placeholder = "-";
              if (typeof field.value === "object") {
                placeholder = "{ ... }";
              }
              if (Array.isArray(field.value)) {
                placeholder = "[ ... ]";
              }
              return /* @__PURE__ */ jsxRuntime.jsx(
                ConditionalTooltip,
                {
                  showTooltip: isDisabled,
                  content: t("draftOrdersPlugin.metadata.disabledRow"),
                  children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "group/table relative", children: [
                    /* @__PURE__ */ jsxRuntime.jsxs(
                      "div",
                      {
                        className: ui.clx("grid grid-cols-2 divide-x", {
                          "overflow-hidden rounded-b-lg": index === fields.length - 1
                        }),
                        children: [
                          /* @__PURE__ */ jsxRuntime.jsx(
                            Form$2.Field,
                            {
                              control: form.control,
                              name: `metadata.${index}.key`,
                              render: ({ field: field2 }) => {
                                return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
                                  GridInput,
                                  {
                                    "aria-labelledby": METADATA_KEY_LABEL_ID,
                                    ...field2,
                                    disabled: isDisabled,
                                    placeholder: t("draftOrdersPlugin.metadata.key")
                                  }
                                ) }) });
                              }
                            }
                          ),
                          /* @__PURE__ */ jsxRuntime.jsx(
                            Form$2.Field,
                            {
                              control: form.control,
                              name: `metadata.${index}.value`,
                              render: ({ field: { value, ...field2 } }) => {
                                return /* @__PURE__ */ jsxRuntime.jsx(Form$2.Item, { children: /* @__PURE__ */ jsxRuntime.jsx(Form$2.Control, { children: /* @__PURE__ */ jsxRuntime.jsx(
                                  GridInput,
                                  {
                                    "aria-labelledby": METADATA_VALUE_LABEL_ID,
                                    ...field2,
                                    value: isDisabled ? placeholder : value,
                                    disabled: isDisabled,
                                    placeholder: t("draftOrdersPlugin.metadata.value")
                                  }
                                ) }) });
                              }
                            }
                          )
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntime.jsxs(ui.DropdownMenu, { children: [
                      /* @__PURE__ */ jsxRuntime.jsx(
                        ui.DropdownMenu.Trigger,
                        {
                          className: ui.clx(
                            "invisible absolute inset-y-0 -right-2.5 my-auto group-hover/table:visible data-[state='open']:visible",
                            {
                              hidden: isDisabled
                            }
                          ),
                          disabled: isDisabled,
                          asChild: true,
                          children: /* @__PURE__ */ jsxRuntime.jsx(ui.IconButton, { size: "2xsmall", children: /* @__PURE__ */ jsxRuntime.jsx(icons.EllipsisVertical, {}) })
                        }
                      ),
                      /* @__PURE__ */ jsxRuntime.jsxs(ui.DropdownMenu.Content, { children: [
                        /* @__PURE__ */ jsxRuntime.jsxs(
                          ui.DropdownMenu.Item,
                          {
                            className: "gap-x-2",
                            onClick: () => insertRow(index, "above"),
                            children: [
                              /* @__PURE__ */ jsxRuntime.jsx(icons.ArrowUpMini, { className: "text-ui-fg-subtle" }),
                              t("draftOrdersPlugin.metadata.insertRowAbove")
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntime.jsxs(
                          ui.DropdownMenu.Item,
                          {
                            className: "gap-x-2",
                            onClick: () => insertRow(index, "below"),
                            children: [
                              /* @__PURE__ */ jsxRuntime.jsx(icons.ArrowDownMini, { className: "text-ui-fg-subtle" }),
                              t("draftOrdersPlugin.metadata.insertRowBelow")
                            ]
                          }
                        ),
                        /* @__PURE__ */ jsxRuntime.jsx(ui.DropdownMenu.Separator, {}),
                        /* @__PURE__ */ jsxRuntime.jsxs(
                          ui.DropdownMenu.Item,
                          {
                            className: "gap-x-2",
                            onClick: () => deleteRow(index),
                            children: [
                              /* @__PURE__ */ jsxRuntime.jsx(icons.Trash, { className: "text-ui-fg-subtle" }),
                              t("draftOrdersPlugin.metadata.deleteRow")
                            ]
                          }
                        )
                      ] })
                    ] })
                  ] })
                },
                field.id
              );
            })
          ] }),
          hasUneditableRows && /* @__PURE__ */ jsxRuntime.jsx(
            InlineTip,
            {
              variant: "warning",
              label: t("draftOrdersPlugin.metadata.disabledRowsLabel"),
              children: t("draftOrdersPlugin.metadata.disabledRowsDescription")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-x-2", children: [
          /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Close, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", variant: "secondary", type: "button", children: t("draftOrdersPlugin.general.cancel") }) }),
          /* @__PURE__ */ jsxRuntime.jsx(ui.Button, { size: "small", type: "submit", isLoading: isPending, children: t("draftOrdersPlugin.general.save") })
        ] }) })
      ]
    }
  ) });
};
const GridInput = React.forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "input",
    {
      ref,
      ...props,
      autoComplete: "off",
      className: ui.clx(
        "txt-compact-small text-ui-fg-base placeholder:text-ui-fg-muted disabled:text-ui-fg-disabled disabled:bg-ui-bg-base bg-transparent px-2 py-1.5 outline-none",
        className
      )
    }
  );
});
GridInput.displayName = "MetadataForm.GridInput";
const PlaceholderInner = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex flex-1 flex-col overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Body, { children: /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "h-[148ox] w-full rounded-lg" }) }),
    /* @__PURE__ */ jsxRuntime.jsx(RouteDrawer.Footer, { children: /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "flex items-center justify-end gap-x-2", children: [
      /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "h-7 w-12 rounded-md" }),
      /* @__PURE__ */ jsxRuntime.jsx(ui.Skeleton, { className: "h-7 w-12 rounded-md" })
    ] }) })
  ] });
};
const EDITABLE_TYPES = ["string", "number", "boolean"];
function getDefaultValues(metadata) {
  if (!metadata || !Object.keys(metadata).length) {
    return [
      {
        key: "",
        value: "",
        disabled: false
      }
    ];
  }
  return Object.entries(metadata).map(([key, value]) => {
    if (!EDITABLE_TYPES.includes(typeof value)) {
      return {
        key,
        value,
        disabled: true
      };
    }
    let stringValue = value;
    if (typeof value !== "string") {
      stringValue = JSON.stringify(value);
    }
    return {
      key,
      value: stringValue,
      original_key: key
    };
  });
}
function parseValues(values) {
  const metadata = values.metadata;
  const isEmpty = !metadata.length || metadata.length === 1 && !metadata[0].key && !metadata[0].value;
  if (isEmpty) {
    return null;
  }
  const update = {};
  metadata.forEach((field) => {
    let key = field.key;
    let value = field.value;
    const disabled = field.disabled;
    if (!key || !value) {
      return;
    }
    if (disabled) {
      update[key] = value;
      return;
    }
    key = key.trim();
    value = value.trim();
    if (value === "true") {
      update[key] = true;
    } else if (value === "false") {
      update[key] = false;
    } else {
      const parsedNumber = parseFloat(value);
      if (!isNaN(parsedNumber)) {
        update[key] = parsedNumber;
      } else {
        update[key] = value;
      }
    }
  });
  return update;
}
function getHasUneditableRows(metadata) {
  if (!metadata) {
    return false;
  }
  return Object.values(metadata).some(
    (value) => !EDITABLE_TYPES.includes(typeof value)
  );
}
const draftOrdersPlugin$1 = /* @__PURE__ */ JSON.parse(`{"general":{"optional":"(Optional)","warning":"Warning","tip":"Tip","cancel":"Cancel","save":"Save","continue":"Continue","add":"Add","update":"Update","confirm":"Confirm","loading":"Loading data for the draft order, please wait..."},"menu":{"drafts":"Drafts"},"combobox":{"selected":"Selected","noResults":"No results found","create":"Create \\"{{value}}\\"","showPopup":"Show popup","hidePopup":"Hide popup"},"numberInput":{"decrease":"Decrease by {{step}}","increase":"Increase by {{step}}"},"table":{"filter":"Filter","sort":"Sort","search":"Search","clearAll":"Clear all","selected_one":"{{count}} selected","selected_other":"{{count}} selected","pagination":{"of":"of","results":"results","pages":"pages","prev":"Prev","next":"Next"}},"fields":{"region":"Region","salesChannel":"Sales Channel","customer":"Customer","email":"Email","country":"Country","selectCountry":"Select country","firstName":"First name","lastName":"Last name","company":"Company","address":"Address","address2":"Apartment, suite, etc.","postalCode":"Postal code","city":"City","province":"Province / State","phone":"Phone"},"list":{"columns":{"displayId":"Display ID","date":"Date"}},"dateFilters":{"today":"Today","last7Days":"Last 7 days","last30Days":"Last 30 days","last90Days":"Last 90 days","last12Months":"Last 12 months","starting":"Starting","ending":"Ending","custom":"Custom","createdAt":"Created at","updatedAt":"Updated at"},"unsavedChanges":{"title":"Unsaved Changes","description":"You have unsaved changes. Are you sure you want to leave?"},"detail":{"title":"Draft Order #{{displayId}}","createdFrom":"{{date}} from {{salesChannel}}","editSalesChannel":"Edit sales channel","delete":"Delete draft order"},"activeEdit":{"title":"Edit pending","noChanges":"There is a pending edit on this draft order with no changes. Click below to cancel it, or open one of the menus to start making changes.","withChanges":"There is a pending edit on this draft order with changes. Click below to cancel it, or continue to complete the edit.","cancelled":"Edit cancelled"},"summary":{"title":"Summary","editItems":"Edit items","editPromotions":"Edit promotions","subtotal":"Subtotal","itemCount_one":"{{count}} item","itemCount_other":"{{count}} items","shipping":"Shipping","discount":"Discount","tax":"Tax","total":"Total","convert":{"action":"Convert to order","title":"Are you sure?","description":"You are about to convert this draft order to an order. This action cannot be undone.","success":"Draft order converted to order"}},"shippingSection":{"title":"Shipping","quantityBadge_one":"{{quantity}}x item","quantityBadge_other":"{{quantity}}x items","profileItemCount_one":"{{count}} items","profileItemCount_other":"{{count}} item","requiresShipping":"Requires shipping","edit":"Edit shipping","add":"Add shipping"},"metadata":{"title":"Metadata","keys_one":"{{count}} keys","keys_other":"{{count}} keys","description":"Add metadata to the draft order.","success":"Metadata updated","key":"Key","value":"Value","disabledRow":"This row is disabled because it contains non-primitive data.","insertRowAbove":"Insert row above","insertRowBelow":"Insert row below","deleteRow":"Delete row","disabledRowsLabel":"Some rows are disabled","disabledRowsDescription":"This object contains non-primitive metadata, such as arrays or objects, that can't be edited here. To edit the disabled rows, use the API directly."},"json":{"keys_one":"{{count}} key","keys_other":"{{count}} keys","description":"View the JSON representation of the draft order."},"customer":{"title":"Customer","transferOwnership":"Transfer ownership","editShippingAddress":"Edit shipping address","editBillingAddress":"Edit billing address","editEmail":"Edit email","id":"ID","contact":"Contact","shippingAddress":"Shipping address","billingAddress":"Billing address","sameAsShipping":"Same as shipping address"},"addressCard":{"shipping":"Shipping","billing":"Billing"},"activity":{"title":"Activity","showMore_one":"Show {{count}} more activity","showMore_other":"Show {{count}} more activities","by":"By","counts":{"items_one":"{{count}} item","items_other":"{{count}} items","shippingMethods_one":"{{count}} shipping method","shippingMethods_other":"{{count}} shipping methods","promotions_one":"{{count}} promotion","promotions_other":"{{count}} promotions"},"added":"Added {{added}}","removed":"Removed {{removed}}","addedAndRemoved":"Added {{added}}, removed {{removed}}","labels":{"itemsAdded":"Items added","itemsRemoved":"Items removed","itemsUpdated":"Items updated","shippingMethodsAdded":"Shipping methods added","shippingMethodsRemoved":"Shipping methods removed","shippingMethodsUpdated":"Shipping methods updated","promotionsAdded":"Promotions added","promotionsRemoved":"Promotions removed","promotionsUpdated":"Promotions updated","transferred":"Transferred","customerUpdated":"Customer updated","salesChannelUpdated":"Sales channel updated","billingAddressUpdated":"Billing address updated","shippingAddressUpdated":"Shipping address updated","emailUpdated":"Email updated","created":"Created"},"content":{"transferred":"Draft order transferred","created":"Draft order created"}},"email":{"title":"Edit Email","description":"Edit the email for the draft order"},"salesChannel":{"title":"Edit Sales Channel","description":"Update which sales channel the draft order is associated with","placeholder":"Select sales channel","success":"Sales channel updated"},"customItems":{"title":"Edit Custom Items"},"shippingAddress":{"title":"Edit Shipping Address","description":"Edit the shipping address for the draft order"},"billingAddress":{"title":"Edit Billing Address","description":"Edit the billing address for the draft order"},"create":{"title":"Create Draft Order","description":"Create a new draft order","regionHint":"Choose region","regionPlaceholder":"Select region","salesChannelHint":"Choose sales channel","emailHint":"Input a email to associate with the order","emailDisabled":"You cannot change the email when a customer is selected","emailPlaceholder":"john@doe.com","customerHint":"Choose an existing customer","customerPlaceholder":"Select customer","shippingAddress":"Shipping address","billingAddress":"Billing address","shippingAddressHint":"Address used for shipping","billingAddressHint":"Address used for billing","sameAsShipping":"Same as shipping address","sameAsShippingHint":"Use the same address for billing and shipping","savedAddresses":"Saved addresses","savedAddressesHint":"Choose one of the customers saved addresses.","selectShippingAddress":"Select shipping address","selectBillingAddress":"Select billing address","customerOrEmailRequired":"Either a customer or email must be provided","shippingAddressRequired":"Shipping address is required","billingAddressRequired":"Billing address is required"},"items":{"title":"Edit Items","description":"Edit the items in the draft order","itemsLabel":"Items","itemsHint":"Choose items from the product catalog.","searchPlaceholder":"Search items","columns":{"item":"Item","quantity":"Quantity","price":"Price"},"empty":{"title":"There are no items in this order","description":"Add items to the order to get started."},"noResults":{"title":"No items found","description":"No items found for \\"{{query}}\\"."},"addItems":"Add items","addCustomItem":"Add custom item"},"orderEdit":{"requestFailed":"Failed to request order edit: {{message}}","confirmFailed":"Failed to confirm order edit: {{message}}"},"variants":{"title":"Product Variants","description":"Choose product variants to add to the order.","submit":"Update items","notManaged":"Not managed","available_one":"{{quantity}} available","available_other":"{{quantity}} available","availableAtLocations":"{{available}} at {{locations}}","locations_one":"{{count}} location","locations_other":"{{count}} locations","columns":{"product":"Product","variant":"Variant","sku":"SKU","updated":"Updated","created":"Created","stock":"Stock"},"oldestFirst":"Oldest first","newestFirst":"Newest first"},"customItem":{"title":"Add custom item","description":"Add a custom item to the order. This will add a new line item that is not associated with an existing product.","titleLabel":"Title","titleHint":"Enter the title of the item","unitPriceLabel":"Unit price","unitPriceHint":"Enter the unit price of the item","quantityLabel":"Quantity","quantityHint":"Enter the quantity of the item","submit":"Add item"},"shipping":{"title":"Shipping","noItems":"This draft order currently has no items. Add items to the order before adding shipping.","editTitle":"Edit Shipping","description":"Choose which shipping method(s) to use for the items in the order.","shippingProfile":"Shipping profile","action":"Action","itemCount_one":"{{count}} item","itemCount_other":"{{count}} items","quantityBadge_one":"{{quantity}}x item","quantityBadge_other":"{{quantity}}x items","editOption":"Edit shipping option","removeOption":"Remove shipping option","addOption":"Add shipping option","formDescription":"Add a shipping method for the selected shipping profile. You can see the items that will be shipped using this method in the preview below.","itemsToShip":"Items to ship","itemsToShipHint":"Items with the selected shipping profile.","location":"Location","locationHint":"Choose where you want to ship the items from.","locationPlaceholder":"Select location","chooseLocationAndProfile":"Choose a location and shipping profile first.","chooseLocation":"Choose a location first.","chooseProfile":"Choose a shipping profile first.","shippingOption":"Shipping option","shippingOptionHint":"Choose the shipping option to use.","shippingOptionPlaceholder":"Select shipping option","customAmount":"Custom amount","customAmountHint":"Set a custom amount for the shipping option."},"promotions":{"title":"Edit Promotions","apply":"Apply promotions","applyHint":"Manage promotions that should be applied to the order.","allocation":{"each":"each","across":"across","once":"once"}},"transferOwnership":{"title":"Transfer Ownership","description":"Transfer the ownership of this draft order to a new customer","currentOwner":"Current owner","currentOwnerHint":"The customer that is currently associated with this draft order.","newCustomer":"New customer","newCustomerHint":"The customer to transfer this draft order to.","placeholder":"Select customer","success":"Customer updated"},"validation":{"required":"Invalid input: expected {{expected}}, received {{received}}","invalidType":"Invalid input: expected {{expected}}, received {{received}}","requiredText":"Too small: expected string to have {{comparison}}{{minimum}} characters","tooShort":"Too small: expected string to have {{comparison}}{{minimum}} characters","invalidEmail":"Invalid email address","invalidValue":"Invalid input: expected {{value}}","invalidOption":"Invalid option: expected one of {{values}}","invalidInput":"Invalid input"}}`);
const en = {
  draftOrdersPlugin: draftOrdersPlugin$1
};
const draftOrdersPlugin = /* @__PURE__ */ JSON.parse('{"general":{"optional":"(Opcional)","warning":"Aviso","tip":"Dica","cancel":"Cancelar","save":"Salvar","continue":"Continuar","add":"Adicionar","update":"Atualizar","confirm":"Confirmar","loading":"Carregando os dados do pedido rascunho, aguarde..."},"menu":{"drafts":"Rascunhos"},"combobox":{"selected":"Selecionado","noResults":"Nenhum resultado encontrado","create":"Criar \\"{{value}}\\"","showPopup":"Mostrar opções","hidePopup":"Ocultar opções"},"numberInput":{"decrease":"Diminuir {{step}}","increase":"Aumentar {{step}}"},"table":{"filter":"Filtrar","sort":"Ordenar","search":"Buscar","clearAll":"Limpar tudo","selected_one":"{{count}} selecionado","selected_other":"{{count}} selecionados","pagination":{"of":"de","results":"resultados","pages":"páginas","prev":"Anterior","next":"Próximo"}},"fields":{"region":"Região","salesChannel":"Canal de venda","customer":"Cliente","email":"E-mail","country":"País","selectCountry":"Selecione o país","firstName":"Nome","lastName":"Sobrenome","company":"Empresa","address":"Endereço","address2":"Complemento","postalCode":"CEP","city":"Cidade","province":"Estado / província","phone":"Telefone"},"list":{"columns":{"displayId":"ID de exibição","date":"Data"}},"dateFilters":{"today":"Hoje","last7Days":"Últimos 7 dias","last30Days":"Últimos 30 dias","last90Days":"Últimos 90 dias","last12Months":"Últimos 12 meses","starting":"A partir de","ending":"Até","custom":"Personalizado","createdAt":"Criado em","updatedAt":"Atualizado em"},"unsavedChanges":{"title":"Alterações não salvas","description":"Você tem alterações não salvas. Tem certeza de que deseja sair?"},"detail":{"title":"Pedido rascunho #{{displayId}}","createdFrom":"{{date}}, via {{salesChannel}}","editSalesChannel":"Editar canal de venda","delete":"Excluir pedido rascunho"},"activeEdit":{"title":"Edição pendente","noChanges":"Há uma edição pendente sem alterações neste pedido rascunho. Clique abaixo para cancelá-la ou abra um dos menus para começar a fazer alterações.","withChanges":"Há uma edição pendente com alterações neste pedido rascunho. Clique abaixo para cancelá-la ou continue para concluir a edição.","cancelled":"Edição cancelada"},"summary":{"title":"Resumo","editItems":"Editar itens","editPromotions":"Editar promoções","subtotal":"Subtotal","itemCount_one":"{{count}} item","itemCount_other":"{{count}} itens","shipping":"Envio","discount":"Desconto","tax":"Imposto","total":"Total","convert":{"action":"Converter em pedido","title":"Tem certeza?","description":"Você está prestes a converter este pedido rascunho em pedido. Esta ação não pode ser desfeita.","success":"Pedido rascunho convertido em pedido"}},"shippingSection":{"title":"Envio","quantityBadge_one":"{{quantity}}x item","quantityBadge_other":"{{quantity}}x itens","profileItemCount_one":"{{count}} item","profileItemCount_other":"{{count}} itens","requiresShipping":"Requer envio","edit":"Editar envio","add":"Adicionar envio"},"metadata":{"title":"Metadados","keys_one":"{{count}} chave","keys_other":"{{count}} chaves","description":"Adicione metadados ao pedido rascunho.","success":"Metadados atualizados","key":"Chave","value":"Valor","disabledRow":"Esta linha está desativada porque contém dados não primitivos.","insertRowAbove":"Inserir linha acima","insertRowBelow":"Inserir linha abaixo","deleteRow":"Excluir linha","disabledRowsLabel":"Algumas linhas estão desativadas","disabledRowsDescription":"Este objeto contém metadados não primitivos, como arrays ou objetos, que não podem ser editados aqui. Para editar as linhas desativadas, use a API diretamente."},"json":{"keys_one":"{{count}} chave","keys_other":"{{count}} chaves","description":"Veja a representação em JSON do pedido rascunho."},"customer":{"title":"Cliente","transferOwnership":"Transferir titularidade","editShippingAddress":"Editar endereço de entrega","editBillingAddress":"Editar endereço de cobrança","editEmail":"Editar e-mail","id":"ID","contact":"Contato","shippingAddress":"Endereço de entrega","billingAddress":"Endereço de cobrança","sameAsShipping":"Igual ao endereço de entrega"},"addressCard":{"shipping":"Entrega","billing":"Cobrança"},"activity":{"title":"Atividade","showMore_one":"Mostrar mais {{count}} atividade","showMore_other":"Mostrar mais {{count}} atividades","by":"Por","counts":{"items_one":"{{count}} item","items_other":"{{count}} itens","shippingMethods_one":"{{count}} método de envio","shippingMethods_other":"{{count}} métodos de envio","promotions_one":"{{count}} promoção","promotions_other":"{{count}} promoções"},"added":"Inclusão de {{added}}","removed":"Remoção de {{removed}}","addedAndRemoved":"Inclusão de {{added}}, remoção de {{removed}}","labels":{"itemsAdded":"Itens adicionados","itemsRemoved":"Itens removidos","itemsUpdated":"Itens atualizados","shippingMethodsAdded":"Métodos de envio adicionados","shippingMethodsRemoved":"Métodos de envio removidos","shippingMethodsUpdated":"Métodos de envio atualizados","promotionsAdded":"Promoções adicionadas","promotionsRemoved":"Promoções removidas","promotionsUpdated":"Promoções atualizadas","transferred":"Transferido","customerUpdated":"Cliente atualizado","salesChannelUpdated":"Canal de venda atualizado","billingAddressUpdated":"Endereço de cobrança atualizado","shippingAddressUpdated":"Endereço de entrega atualizado","emailUpdated":"E-mail atualizado","created":"Criado"},"content":{"transferred":"Pedido rascunho transferido","created":"Pedido rascunho criado"}},"email":{"title":"Editar e-mail","description":"Edite o e-mail do pedido rascunho"},"salesChannel":{"title":"Editar canal de venda","description":"Altere o canal de venda associado ao pedido rascunho","placeholder":"Selecione o canal de venda","success":"Canal de venda atualizado"},"customItems":{"title":"Editar itens personalizados"},"shippingAddress":{"title":"Editar endereço de entrega","description":"Edite o endereço de entrega do pedido rascunho"},"billingAddress":{"title":"Editar endereço de cobrança","description":"Edite o endereço de cobrança do pedido rascunho"},"create":{"title":"Criar pedido rascunho","description":"Crie um novo pedido rascunho","regionHint":"Escolha a região","regionPlaceholder":"Selecione a região","salesChannelHint":"Escolha o canal de venda","emailHint":"Informe um e-mail para associar ao pedido","emailDisabled":"Não é possível alterar o e-mail quando um cliente está selecionado","emailPlaceholder":"joao@exemplo.com.br","customerHint":"Escolha um cliente existente","customerPlaceholder":"Selecione o cliente","shippingAddress":"Endereço de entrega","billingAddress":"Endereço de cobrança","shippingAddressHint":"Endereço usado para a entrega","billingAddressHint":"Endereço usado para a cobrança","sameAsShipping":"Igual ao endereço de entrega","sameAsShippingHint":"Usar o mesmo endereço para cobrança e entrega","savedAddresses":"Endereços salvos","savedAddressesHint":"Escolha um dos endereços salvos do cliente.","selectShippingAddress":"Selecione o endereço de entrega","selectBillingAddress":"Selecione o endereço de cobrança","customerOrEmailRequired":"Informe um cliente ou um e-mail","shippingAddressRequired":"O endereço de entrega é obrigatório","billingAddressRequired":"O endereço de cobrança é obrigatório"},"items":{"title":"Editar itens","description":"Edite os itens do pedido rascunho","itemsLabel":"Itens","itemsHint":"Escolha itens do catálogo de produtos.","searchPlaceholder":"Buscar itens","columns":{"item":"Item","quantity":"Quantidade","price":"Preço"},"empty":{"title":"Não há itens neste pedido","description":"Adicione itens ao pedido para começar."},"noResults":{"title":"Nenhum item encontrado","description":"Nenhum item encontrado para \\"{{query}}\\"."},"addItems":"Adicionar itens","addCustomItem":"Adicionar item personalizado"},"orderEdit":{"requestFailed":"Não foi possível iniciar a edição do pedido: {{message}}","confirmFailed":"Não foi possível confirmar a edição do pedido: {{message}}"},"variants":{"title":"Variantes de produto","description":"Escolha as variantes de produto para adicionar ao pedido.","submit":"Atualizar itens","notManaged":"Não gerenciado","available_one":"{{quantity}} disponível","available_other":"{{quantity}} disponíveis","availableAtLocations":"{{available}} em {{locations}}","locations_one":"{{count}} local","locations_other":"{{count}} locais","columns":{"product":"Produto","variant":"Variante","sku":"SKU","updated":"Atualizado","created":"Criado","stock":"Estoque"},"oldestFirst":"Mais antigos primeiro","newestFirst":"Mais recentes primeiro"},"customItem":{"title":"Adicionar item personalizado","description":"Adicione um item personalizado ao pedido. Ele entra como um novo item, sem vínculo com um produto existente.","titleLabel":"Título","titleHint":"Informe o título do item","unitPriceLabel":"Preço unitário","unitPriceHint":"Informe o preço unitário do item","quantityLabel":"Quantidade","quantityHint":"Informe a quantidade do item","submit":"Adicionar item"},"shipping":{"title":"Envio","noItems":"Este pedido rascunho ainda não tem itens. Adicione itens ao pedido antes de adicionar o envio.","editTitle":"Editar envio","description":"Escolha os métodos de envio dos itens do pedido.","shippingProfile":"Perfil de envio","action":"Ação","itemCount_one":"{{count}} item","itemCount_other":"{{count}} itens","quantityBadge_one":"{{quantity}}x item","quantityBadge_other":"{{quantity}}x itens","editOption":"Editar opção de envio","removeOption":"Remover opção de envio","addOption":"Adicionar opção de envio","formDescription":"Adicione um método de envio para o perfil de envio selecionado. A prévia abaixo mostra os itens que serão enviados por esse método.","itemsToShip":"Itens a enviar","itemsToShipHint":"Itens com o perfil de envio selecionado.","location":"Local","locationHint":"Escolha de onde os itens serão enviados.","locationPlaceholder":"Selecione o local","chooseLocationAndProfile":"Escolha um local e um perfil de envio primeiro.","chooseLocation":"Escolha um local primeiro.","chooseProfile":"Escolha um perfil de envio primeiro.","shippingOption":"Opção de envio","shippingOptionHint":"Escolha a opção de envio.","shippingOptionPlaceholder":"Selecione a opção de envio","customAmount":"Valor personalizado","customAmountHint":"Defina um valor personalizado para a opção de envio."},"promotions":{"title":"Editar promoções","apply":"Aplicar promoções","applyHint":"Gerencie as promoções aplicadas ao pedido.","allocation":{"each":"cada","across":"dividido","once":"uma vez"}},"transferOwnership":{"title":"Transferir titularidade","description":"Transfira a titularidade deste pedido rascunho para outro cliente","currentOwner":"Titular atual","currentOwnerHint":"O cliente associado a este pedido rascunho no momento.","newCustomer":"Novo cliente","newCustomerHint":"O cliente que receberá este pedido rascunho.","placeholder":"Selecione o cliente","success":"Cliente atualizado"},"validation":{"required":"Campo obrigatório","invalidType":"Valor inválido","requiredText":"Campo obrigatório","tooShort":"Use pelo menos {{length}} caracteres","invalidEmail":"E-mail inválido","invalidValue":"Valor inválido","invalidOption":"Opção inválida","invalidInput":"Valor inválido"}}');
const ptBR = {
  draftOrdersPlugin
};
const i18nTranslations0 = {
  en: {
    translation: en
  },
  ptBR: {
    translation: ptBR
  }
};
const widgetModule = { widgets: [] };
const routeModule = {
  routes: [
    {
      Component: List,
      path: "/draft-orders",
      handle: { label: config.label, translationNs: config.translationNs, ...handle$1 },
      children: [
        {
          Component: Create,
          path: "/draft-orders/create"
        }
      ]
    },
    {
      Component: ID,
      path: "/draft-orders/:id",
      handle,
      loader,
      children: [
        {
          Component: BillingAddress,
          path: "/draft-orders/:id/billing-address"
        },
        {
          Component: Email,
          path: "/draft-orders/:id/email"
        },
        {
          Component: Items,
          path: "/draft-orders/:id/items"
        },
        {
          Component: CustomItems,
          path: "/draft-orders/:id/custom-items"
        },
        {
          Component: Promotions,
          path: "/draft-orders/:id/promotions"
        },
        {
          Component: SalesChannel,
          path: "/draft-orders/:id/sales-channel"
        },
        {
          Component: ShippingAddress,
          path: "/draft-orders/:id/shipping-address"
        },
        {
          Component: Shipping,
          path: "/draft-orders/:id/shipping"
        },
        {
          Component: TransferOwnership,
          path: "/draft-orders/:id/transfer-ownership"
        },
        {
          Component: Metadata,
          path: "/draft-orders/:id/metadata"
        }
      ]
    }
  ]
};
const menuItemModule = {
  menuItems: [
    {
      label: config.label,
      icon: void 0,
      path: "/draft-orders",
      nested: "/orders",
      rank: void 0,
      translationNs: config.translationNs
    }
  ]
};
const formModule = { customFields: {} };
const displayModule = {
  displays: {}
};
const i18nModule = { resources: i18nTranslations0 };
const cellRendererModule = {};
const layoutModule = { layouts: [] };
const searchEntityModule = {};
const plugin = {
  widgetModule,
  routeModule,
  menuItemModule,
  formModule,
  displayModule,
  i18nModule,
  cellRendererModule,
  layoutModule,
  searchEntityModule
};
module.exports = plugin;
