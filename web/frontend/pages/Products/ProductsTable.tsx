import React, {useCallback, useEffect, useState} from "react";
import {NonEmptyArray} from "@shopify/polaris/build/ts/src/types";
import {IndexTableHeading, IndexTableSortDirection} from "@shopify/polaris/build/ts/src/components/IndexTable";
import {
  ActionListItemDescriptor,
  Avatar,
  Badge,
  ChoiceList,
  Frame,
  HorizontalStack,
  IndexFilters,
  IndexFiltersProps,
  IndexTable,
  LegacyCard,
  Pagination,
  Spinner,
  TabProps,
  Text,
  TextField,
  Tooltip,
  useSetIndexFiltersMode,
} from "@shopify/polaris";
import {Link} from "react-router-dom";
import "./style.css";
import {EditMinor, ViewMinor} from "@shopify/polaris-icons";
import {E_SORT_PRODUCTS, E_STATUS_PRODUCTS, I_ProductsGetDto} from "../../graphql/products/products.interfaces";
import {DEFAULT_IMAGE} from "../../constants/constants";
import {capitalize} from "../../utils/capitalize";
import {openNewTab} from "../../utils/openNewTab";
import {PopoverWithActionList} from "../../components/Popover/Popover";
import {getBadgeStatus} from "./SingleProduct/SingleProduct";

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
    case "status":
      return `Status like ${(value as string[])
        .map((val) => ` ${val}`)
        .join(", ")}`;
    case "vendor":
      return `Vendor like ${value}`;
    case "tagged":
      return `Tagged with ${value}`;
    case "type":
      return `Product type like ${value}`;
    default:
      return value as string;
  }
}

function convertIndexColumnToSort(index: number) {
  console.log(index)
  switch (index){
    case 1:
      return E_SORT_PRODUCTS.title;
    case 3:
      return E_SORT_PRODUCTS.inventory;
    case 6:
      return E_SORT_PRODUCTS.productType;
    case 7:
      return E_SORT_PRODUCTS.vendor;
  }
}

function convertSortToIndexColumn(sort: E_SORT_PRODUCTS) {
  switch (sort){
    case E_SORT_PRODUCTS.title:
      return 1;
    case E_SORT_PRODUCTS.inventory:
      return 3;
    case E_SORT_PRODUCTS.productType:
      return 6;
    case E_SORT_PRODUCTS.vendor:
      return 7;
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
  vendor: string;
  tagged: string;
  type: string;
  status: string[];
}

const DEFAULT_ITEM = {
  filterName: "All",
  queryString: "",
  vendor: "",
  tagged: "",
  type: "",
  status: [],
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
  const [sort, setSort] = useState<{column: number, sort: "ascending" | "descending"}>(undefined)
  const [vendor, setVendor] = useState("")
  const [tagged, setTagged] = useState("")
  const [type, setType] = useState("")
  const [status, setStatus] = useState<string[] | undefined>(
      undefined
  );
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
    setStatus(itemFromStorage.status);
    setType(itemFromStorage.type);
    setTagged(itemFromStorage.tagged);
    setVendor(itemFromStorage.vendor);
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

  const duplicateView = (name: string) => {
    setStorage((prev) => {
      const prevStorage = [...prev];
      prevStorage.push({
        filterName: name,
        sortSelected,
        queryString: queryValue,
        tagged,
        type,
        vendor,
        status
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
        status,
        vendor,
        type,
        tagged
      } as I_Storage);
      return prevStorage;
    });
    return true;
  };

  const handleSort = (e: string[]) => {
    const arr = e[0].split(' ');
    setSort({column: convertSortToIndexColumn(arr[0] as E_SORT_PRODUCTS), sort: arr[1] === 'asc' ? 'ascending' : 'descending'});
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
          prevStorageItem.type = type;
          prevStorageItem.vendor = vendor;
          prevStorageItem.tagged = tagged;
          prevStorageItem.status = status;
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
  const handleChangeVendor = useCallback(
      (value: string) => setVendor(value),
      []
  );
  const handleChangeType = useCallback(
      (value: string) => setType(value),
      []
  );
  const handleChangeTagged = useCallback(
      (value: string) => setTagged(value),
      []
  );
  const handleChangeStatus = useCallback(
      (value: string[]) => setStatus(value),
      []
  );
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleTypeValueRemove = useCallback(() => setType(""), []);
  const handleVendorValueRemove = useCallback(() => setVendor(""), []);
  const handleTaggedValueRemove = useCallback(() => setTagged(""), []);
  const handleStatusValueRemove = useCallback(() => setStatus(undefined), []);
  const handleFiltersClearAll = useCallback(() => {
    handleQueryValueRemove();
    handleStatusValueRemove();
    handleTypeValueRemove();
    handleVendorValueRemove();
    handleTaggedValueRemove();
  }, [
    handleQueryValueRemove,
    handleStatusValueRemove,
    handleTypeValueRemove,
    handleVendorValueRemove,
    handleTaggedValueRemove
  ]);

  const filters: any = [
    {
      key: "vendor",
      label: "Product vendor",
      filter: (
        <TextField
          label=""
          value={vendor || ""}
          onChange={handleChangeVendor}
         autoComplete={"off"}/>
      ),
      shortcut: true,
    },
    {
      key: "tagged",
      label: "Tagged with",
      filter: (
          <TextField
              label=""
              value={tagged || ""}
              onChange={handleChangeTagged}
              autoComplete={"off"}/>
      ),
      shortcut: true,
    },
    {
      key: "type",
      label: "Product type",
      filter: (
          <TextField
              label=""
              value={type || ""}
              onChange={handleChangeType}
              autoComplete={"off"}/>
      ),
      shortcut: true,
    },
    {
      key: "status",
      label: "Status like",
      filter: (
          <ChoiceList
              title="Status"
              titleHidden
              choices={[
                { label: E_STATUS_PRODUCTS.active, value: E_STATUS_PRODUCTS.active },
                { label: E_STATUS_PRODUCTS.draft, value: E_STATUS_PRODUCTS.draft },
              ]}
              selected={status || []}
              onChange={handleChangeStatus}
              allowMultiple
          />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters: IndexFiltersProps["appliedFilters"] = [];
  if (status && !isEmpty(status)) {
    const key = "status";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, status),
      onRemove: handleStatusValueRemove,
    });
  }
  if (vendor && !isEmpty(vendor)) {
    const key = "vendor";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, vendor),
      onRemove: handleVendorValueRemove,
    });
  }
  if (type && !isEmpty(type)) {
    const key = "type";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, type),
      onRemove: handleTypeValueRemove,
    });
  }
  if (tagged && !isEmpty(tagged)) {
    const key = "tagged";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, tagged),
      onRemove: handleTaggedValueRemove,
    });
  }

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const findAppsById = (id: string): ActionListItemDescriptor[] => {
    if(!data.dataApps)
      return [];

    const apps = data.dataApps?.data?.products?.nodes?.find((n:any)=>n?.id === id)
        ?.channelPublications?.nodes ?? []

    const preparedApps = apps
        .map((m:any)=>{
          const app = m.publication;
          const result: ActionListItemDescriptor = {active: true, variant: "menu", content: app.name}
          return result;
        })
    return preparedApps;
  }

  const findMarketsById = (id: string):  ActionListItemDescriptor[] => {
    if(!data.dataMarkets)
      return [];

    const markets = data.dataMarkets?.data?.products?.nodes?.find((n:any)=>n?.id === id)
        ?.channelPublications?.nodes ?? [];

    const preparedMarkets = markets
        .map((m:any)=>{
          const market = m.publication.catalog.markets.nodes[0];
          const result: ActionListItemDescriptor = {active: market.enabled, variant: "menu", content: market.name}
          return result;
        })
    return preparedMarkets;
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
              <Badge status={getBadgeStatus(p.status)}>{capitalize(p.status)}</Badge>
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as={"h3"} color={p?.tracksInventory && p?.totalInventory < 0 ? 'critical' : 'subdued'} alignment={"start"}>
              {p?.tracksInventory ? `${p?.totalInventory} in stock` : 'Inventory not tracked'}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as={"h3"} alignment={"center"}>
              {loadings.dataAppsLoading ? <Spinner/> :
                  <PopoverWithActionList items={apps} text={apps?.length.toString()}/>
              }
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as={"h3"} alignment={"center"}>
              {loadings.dataMarketsLoading ? <Spinner/> :
                <PopoverWithActionList items={markets} text={markets?.length.toString()}/>
              }
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

    const title = queryValue;

    if (title) query.push(`title:${title}*`);
    if (vendor) query.push(`vendor:${vendor}*`);
    if (type) query.push(`product_type:${type}*`);
    if (tagged) query.push(`tag:${tagged}*`);
    if (status?.length)
      query.push(`(${status.map(s=>`status:${s}`).join(' OR ')})`)

    return {
      sort: _sortData.at(0),
      reverse: _sortData.at(-1) !== "asc",
      first: cursor?.variant === "after" || !cursor ? 10 : undefined,
      last: cursor?.variant === "before" ? 10 : undefined,
      after: cursor?.variant === "after" ? cursor.cursor : undefined,
      before: cursor?.variant === "before" ? cursor.cursor : undefined,
      query: query.length > 0 ? query.join(" ") : undefined,
    } as I_ProductsGetDto;
  }, [sortSelected, queryValue, cursor, selected, vendor, type, status, tagged]);

  const handleNext = () => {
    setCursor({ cursor: pageInfo?.endCursor, variant: "after" });
  };

  const handlePrevious = () => {
    setCursor({ cursor: pageInfo?.startCursor, variant: "before" });
  };

  const onSort = (headingIndex: number, direction: IndexTableSortDirection) => {
    setSort({column: headingIndex, sort: direction});
    setSortSelected([`${convertIndexColumnToSort(headingIndex)} ${direction === 'ascending' ? 'asc' : 'desc'}`]);
  }

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
          sortDirection={sort?.sort}
          sortColumnIndex={sort?.column}
          onSort={onSort}
          sortable={[false, true, false, true, false, false, true, true]}
          // sortToggleLabels={}
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
