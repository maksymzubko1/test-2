import React, { useCallback, useEffect, useState } from "react";
import { NonEmptyArray } from "@shopify/polaris/build/ts/src/types";
import { IndexTableHeading } from "@shopify/polaris/build/ts/src/components/IndexTable";
import {
  Avatar, Badge,
  Frame, HorizontalStack,
  IndexFilters,
  IndexFiltersProps,
  IndexTable,
  LegacyCard,
  Pagination, Spinner,
  TabProps,
  Text,
  Tooltip,
  useSetIndexFiltersMode,
} from "@shopify/polaris";
import {Link, useNavigate} from "react-router-dom";
import "./style.css";
import moment from "moment";
import {EditMinor, ViewMinor} from "@shopify/polaris-icons";
import {E_SORT_PRODUCTS, I_ProductsGetDto} from "../../graphql/products/products.interfaces";
import {DEFAULT_IMAGE} from "../../constants/constants";
import {capitalize} from "../../utils/capitalize";
import {openNewTab} from "../../utils/openNewTab";

const headings: NonEmptyArray<IndexTableHeading> = [
  { title: "", alignment: "start" },
  { title: "Product", alignment: "start" },
  { title: "Status", alignment: "start" },
  { title: "Inventory", alignment: "start" },
  { title: "Sales channels", alignment: "start" },
  { title: "Markets", alignment: "start" },
  { title: "Type", alignment: "start" },
  { title: "Vendor", alignment: "start" },
];

function disambiguateLabel(key: string, value: string | any[]): string {
  switch (key) {
    case "dateRange":
      const datesEquals = moment(value[0]).isSame(moment(value[1]));
      if (datesEquals) return `Date equal ${moment(value[0]).format("MM-DD-yyyy")}`;
      return `Date range is between ${moment(value[0]).format(
        "MM-DD-yyyy"
      )} and ${moment(value[1]).format("MM-DD-yyyy")}`;
    case "financialStatus":
      return `Status like ${(value as string[])
        .map((val) => ` ${val}`)
        .join(", ")}`;
    default:
      return value as string;
  }
}

function isEmpty(value: string | string[]): boolean {
  if (Array.isArray(value)) {
    return value.length === 0;
  } else {
    return value === "" || value == null;
  }
}

interface I_Props {
  data: { allData: any; dataApps: any; dataMarkets: any; };
  loadings: { allDataLoading: boolean; dataAppsLoading: boolean; dataMarketsLoading: boolean; };
  onRequest: (options: I_ProductsGetDto) => void;
}

interface I_Storage {
  filterName: string;
  sortSelected: string[];
  queryString: string;
  financialStatus: string[];
}

const DEFAULT_ITEM = {
  filterName: "All",
  queryString: "",
  financialStatus: [],
  sortSelected: [`${E_SORT_PRODUCTS.createdAt} asc`],
} as I_Storage;

function handleStorageItems() {
  const _localStorage = localStorage.getItem("storageAppProducts");
  if (!_localStorage)
    localStorage.setItem("storageAppProducts", JSON.stringify([DEFAULT_ITEM]));
  else {
    try {
      return JSON.parse(_localStorage) as I_Storage[];
    } catch (err) {
      console.log(_localStorage);
      return null;
    }
  }
}

const ProductsTable = ({ data, loadings, onRequest }: I_Props) => {
  const [itemStrings, setItemStrings] = useState(["All"]);
  const [storage, setStorage] = useState<I_Storage[]>([DEFAULT_ITEM]);
  const { nodes, pageInfo } = data?.allData?.data?.products ?? {
    nodes: undefined,
    pageInfo: undefined,
  };
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const [cursor, setCursor] = useState<
    { cursor: string; variant: "before" | "after" } | undefined
  >(undefined);
  const sortOptions: IndexFiltersProps["sortOptions"] = [
    {
      label: "Product title",
      value: `${E_SORT_PRODUCTS.title} asc`,
      directionLabel: "A-Z",
    },
    {
      label: "Product title",
      value: `${E_SORT_PRODUCTS.title} desc`,
      directionLabel: "Z-A",
    },
    {
      label: "Created",
      value: `${E_SORT_PRODUCTS.createdAt} asc`,
      directionLabel: "Oldest first",
    },
    {
      label: "Created",
      value: `${E_SORT_PRODUCTS.createdAt} desc`,
      directionLabel: "Newest first",
    },
    {
      label: "Updated",
      value: `${E_SORT_PRODUCTS.updatedAt} asc`,
      directionLabel: "Oldest first",
    },
    {
      label: "Updated",
      value: `${E_SORT_PRODUCTS.updatedAt} desc`,
      directionLabel: "Newest first",
    },
    {
      label: "Inventory",
      value: `${E_SORT_PRODUCTS.inventory} asc`,
      directionLabel: "Lowest to highest",
    },
    {
      label: "Inventory",
      value: `${E_SORT_PRODUCTS.inventory} desc`,
      directionLabel: "Highest to lowest",
    },
    {
      label: "Product type",
      value: `${E_SORT_PRODUCTS.productType} asc`,
      directionLabel: "A-Z",
    },
    {
      label: "Product type",
      value: `${E_SORT_PRODUCTS.productType} desc`,
      directionLabel: "Z-A",
    },
    {
      label: "Vendor",
      value: `${E_SORT_PRODUCTS.vendor} asc`,
      directionLabel: "A-Z",
    },
    {
      label: "Vendor",
      value: `${E_SORT_PRODUCTS.vendor} desc`,
      directionLabel: "Z-A",
    },
  ];
  const [sortSelected, setSortSelected] = useState(["CREATED_AT asc"]);

  const [queryValue, setQueryValue] = useState("");
  const [manualSetup, setManualSetup] = useState(false);

  useEffect(() => {
    const _storage = handleStorageItems();
    if (_storage) setStorage(_storage);
  }, []);

  useEffect(() => {
    localStorage.setItem("storageAppProducts", JSON.stringify(storage));
    setItemStrings(storage.map((s) => s.filterName));
  }, [storage]);

  useEffect(() => {
    setManualSetup(true);
    const itemFromStorage = storage.find((s, i) => i === selected);
    setQueryValue(itemFromStorage.queryString);
    setSortSelected(itemFromStorage.sortSelected);
    setManualSetup(false);
  }, [selected, storage, itemStrings]);

  useEffect(() => {
    if (!manualSetup) {
      const params = getAllParams();
      onRequest(params);
    }
  }, [cursor, sortSelected, selected, manualSetup]);

  const deleteView = (index: number) => {
    setStorage((prev) => {
      const prevStorage = [...prev];
      prevStorage.splice(index, 1);
      return prevStorage;
    });
    setSelected(0);
  };

  const duplicateView = async (name: string) => {
    setStorage((prev) => {
      const prevStorage = [...prev];
      prevStorage.push({
        filterName: name,
        sortSelected,
        queryString: queryValue,
      } as I_Storage);
      return prevStorage;
    });
    return true;
  };

  const tabs: TabProps[] = itemStrings.map((item, index) => ({
    content: item,
    index,
    onAction: () => {},
    id: `${item}-${index}`,
    isLocked: index === 0,
    actions:
      index === 0
        ? []
        : [
            {
              icon: EditMinor,
              type: "rename",
              onAction: () => {},
              onPrimaryAction: async (value: string): Promise<boolean> => {
                setStorage((prev) => {
                  const prevStorage = [...prev];
                  for (const prevStorageItem of prevStorage) {
                    if (prevStorageItem.filterName === itemStrings[selected]) {
                      prevStorageItem.filterName = value;
                      break;
                    }
                  }
                  return prevStorage;
                });
                return true;
              },
            },
            {
              type: "duplicate",
              onPrimaryAction: async (value: string): Promise<boolean> => {
                duplicateView(value);
                return true;
              },
            },
            {
              type: "delete",
              onPrimaryAction: async () => {
                deleteView(index);
                return true;
              },
            },
          ],
  }));

  const handleSelect = (e: number) => {
    setSelected(e);
  };

  const onCreateNewView = async (value: string) => {
    setStorage((prev) => {
      const prevStorage = [...prev];
      prevStorage.push({
        filterName: value,
        sortSelected,
        queryString: queryValue,
      } as I_Storage);
      return prevStorage;
    });
    return true;
  };

  const handleSort = (e: string[]) => {
    setSortSelected(e);

    setStorage((prev) => {
      const prevStorage = [...prev];
      for (const prevStorageItem of prevStorage) {
        if (prevStorageItem.filterName === itemStrings[selected]) {
          prevStorageItem.sortSelected = e;
          break;
        }
      }
      return prevStorage;
    });
  };

  const { mode, setMode } = useSetIndexFiltersMode();
  const onHandleCancel = () => {};

  const onHandleSave = async () => {
    const params = getAllParams();
    onRequest(params);
    setStorage((prev) => {
      const prevStorage = [...prev];
      for (const prevStorageItem of prevStorage) {
        if (prevStorageItem.filterName === itemStrings[selected]) {
          prevStorageItem.queryString = queryValue;
          prevStorageItem.sortSelected = sortSelected;
          break;
        }
      }
      return prevStorage;
    });
    return true;
  };

  const primaryAction: IndexFiltersProps["primaryAction"] =
    selected === 0
      ? {
          type: "save-as",
          onAction: onCreateNewView,
          disabled: false,
          loading: false,
        }
      : {
          type: "save",
          onAction: onHandleSave,
          disabled: false,
          loading: false,
        };

  const handleFiltersQueryChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleFiltersClearAll = useCallback(() => {
    handleQueryValueRemove();
  }, [
    handleQueryValueRemove,
  ]);

  const filters: any = [
    // {
    //   key: "financialStatus",
    //   label: "Status like",
    //   filter: (
    //     <ChoiceList
    //       title="Financial Status"
    //       titleHidden
    //       choices={[
    //         { label: "DRAFT", value: E_STATUS_PRODUCTS.draft },
    //         { label: "ACTIVE", value: E_STATUS_PRODUCTS.active },
    //       ]}
    //       selected={financialStatus || []}
    //       onChange={handleFinancialStatusChange}
    //       allowMultiple
    //     />
    //   ),
    //   shortcut: true,
    // },
  ];

  const appliedFilters: IndexFiltersProps["appliedFilters"] = [];
  // if (financialStatus && !isEmpty(financialStatus)) {
  //   const key = "financialStatus";
  //   appliedFilters.push({
  //     key,
  //     label: disambiguateLabel(key, financialStatus),
  //     onRemove: handleFinancialStatusRemove,
  //   });
  // }

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const findAppsById = (id: string) => {
    if(!data.dataApps)
      return [];

    return data.dataApps?.data?.products?.nodes?.find((n:any)=>n?.id === id)
        ?.channelPublications?.nodes ?? []
  }

  const findMarketsById = (id: string) => {
    if(!data.dataMarkets)
      return [];

    return data.dataMarkets?.data?.products?.nodes?.find((n:any)=>n?.id === id)
        ?.channelPublications?.nodes ?? []
  }

  const rowMarkup = useCallback(() => {
    if (!data || nodes?.length === 0)
      return (
        <IndexTable.Row id={"0"} position={0}>
          <Text
            variant="bodyLg"
            fontWeight="bold"
            as="span"
            alignment={"center"}
          >
            No data found!
          </Text>
        </IndexTable.Row>
      );

    return nodes?.map((p: any, index: number) => {
      const apps = findAppsById(p.id);
      const markets = findMarketsById(p.id);

      return (
        <IndexTable.Row id={p.id} key={p.id} position={index} >
          <IndexTable.Cell>
            <Avatar source={p?.featuredImage?.url ?? DEFAULT_IMAGE}/>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              <HorizontalStack gap={"5"} blockAlign={"center"}>
              <Link to={`/products/${p.id.split("/").at(-1)}`}>{p.title}</Link>
                <span className={"view_icon"}>
                  <Tooltip content={"Preview on Online Store"}>
                    <Text as={'span'}>
                      <ViewMinor height={"20"} display={"flex"} width={"20"} onClick={()=>openNewTab(p?.onlineStorePreviewUrl)}/>
                    </Text>
                  </Tooltip>
                </span>
              </HorizontalStack>
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as={"h3"} alignment={"start"}>
              <Badge status={p.status === 'ACTIVE' ? 'success' : 'info'}>{capitalize(p.status)}</Badge>
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as={"h3"} alignment={"start"}>
              {p?.tracksInventory ? `${p?.totalInventory} in stock` : 'Inventory not tracked'}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as={"h3"} alignment={"center"}>
              {loadings.dataAppsLoading ? <Spinner/> : apps?.length}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as={"h3"} alignment={"center"}>
              {loadings.dataMarketsLoading ? <Spinner/> : markets?.length}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as={"h3"} alignment={"start"}>
              {p.productType}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as={"h3"} alignment={"start"}>
              {p.vendor}
            </Text>
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    });
  }, [data]);

  const getAllParams = useCallback(() => {
    const _sortData = sortSelected.at(-1).split(" ");
    const query: string[] = [];

    const name = queryValue;

    if (name) query.push(`name:${name}*`);

    return {
      sort: _sortData.at(0),
      reverse: _sortData.at(-1) !== "asc",
      first: cursor?.variant === "after" || !cursor ? 10 : undefined,
      last: cursor?.variant === "before" ? 10 : undefined,
      after: cursor?.variant === "after" ? cursor.cursor : undefined,
      before: cursor?.variant === "before" ? cursor.cursor : undefined,
      query: query.length > 0 ? query.join(" ") : undefined,
    } as I_ProductsGetDto;
  }, [sortSelected, queryValue, cursor, selected]);

  const handleNext = () => {
    setCursor({ cursor: pageInfo?.endCursor, variant: "after" });
  };

  const handlePrevious = () => {
    setCursor({ cursor: pageInfo?.startCursor, variant: "before" });
  };

  return (
    <Frame>
      <LegacyCard>
        <IndexFilters
          sortOptions={sortOptions}
          sortSelected={sortSelected}
          queryValue={queryValue}
          queryPlaceholder="Search by title"
          onQueryChange={handleFiltersQueryChange}
          onQueryClear={() => {}}
          onSort={handleSort}
          primaryAction={primaryAction}
          cancelAction={{
            onAction: onHandleCancel,
            disabled: false,
            loading: false,
          }}
          tabs={tabs}
          selected={selected}
          onSelect={handleSelect}
          onCreateNewView={onCreateNewView}
          filters={filters}
          appliedFilters={appliedFilters}
          onClearAll={handleFiltersClearAll}
          mode={mode}
          setMode={setMode}
          loading={loadings.allDataLoading}
        />
        <IndexTable
          selectable={false}
          loading={loadings.allDataLoading}
          headings={headings}
          hasZebraStriping={true}
          resourceName={resourceName}
          itemCount={nodes?.length ?? 0}
        >
          {rowMarkup()}
          <tr className={"pagination"}>
            <td colSpan={8} align={"center"}>
              <Pagination
                type={"table"}
                hasNext={pageInfo?.hasNextPage}
                hasPrevious={pageInfo?.hasPreviousPage}
                onNext={handleNext}
                onPrevious={handlePrevious}
              ></Pagination>
            </td>
          </tr>
        </IndexTable>
      </LegacyCard>
    </Frame>
  );
};

export default ProductsTable;
