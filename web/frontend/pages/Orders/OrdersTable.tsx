import React, { useCallback, useEffect, useState } from "react";
import { NonEmptyArray } from "@shopify/polaris/build/ts/src/types";
import { IndexTableHeading } from "@shopify/polaris/build/ts/src/components/IndexTable";
import {
  Box,
  ChoiceList,
  DatePicker,
  Frame,
  IndexFilters,
  IndexFiltersProps,
  IndexTable,
  LegacyCard,
  Pagination,
  TabProps,
  Text,
  Tooltip,
  useSetIndexFiltersMode,
} from "@shopify/polaris";
import { Link } from "react-router-dom";
import {
  E_SORT,
  E_STATUS,
  I_OrdersGetDto,
} from "../../graphql/orders.interfaces";
import cl from "./style.module.css";
import moment from "moment";
import { FinancialStatus } from "../../components/FinancialStatus/FinancialStatus";
import { EditMinor } from "@shopify/polaris-icons";

const headings: NonEmptyArray<IndexTableHeading> = [
  { title: "Order", alignment: "start" },
  { title: "Total Price", alignment: "center" },
  { title: "Items Count", alignment: "center" },
  { title: "Address", alignment: "start" },
  { title: "Created Date", alignment: "center" },
  { title: "Financial Status", alignment: "center" },
];

function disambiguateLabel(key: string, value: string | any[]): string {
  switch (key) {
    case "dateRange":
      const datesEquals = moment(value[0]).isSame(value[1]);
      if (datesEquals) return `Date equal ${moment().format("MM-DD-yyyy")}`;
      return `Date range is between ${moment().format(
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
  data: any;
  isLoading: boolean;
  onRequest: (options: I_OrdersGetDto) => void;
}

interface I_Storage {
  filterName: string;
  sortSelected: string[];
  queryString: string;
  selectedDates: { start: Date; end: Date } | undefined;
  financialStatus: string[];
}

const DEFAULT_ITEM = {
  filterName: "All",
  queryString: "",
  financialStatus: [],
  selectedDates: undefined,
  sortSelected: [`${E_SORT.createdAt} asc`],
} as I_Storage;

function handleStorageItems() {
  const _localStorage = localStorage.getItem("storageAppOrders");
  if (!_localStorage)
    localStorage.setItem("storageAppOrders", JSON.stringify([DEFAULT_ITEM]));
  else {
    try {
      return JSON.parse(_localStorage) as I_Storage[];
    } catch (err) {
      console.log(_localStorage);
      return null;
    }
  }
}

const OrdersTable = ({ data, isLoading, onRequest }: I_Props) => {
  const [itemStrings, setItemStrings] = useState(["All"]);
  const [storage, setStorage] = useState<I_Storage[]>([DEFAULT_ITEM]);
  const { nodes, pageInfo } = data?.data?.orders ?? {
    nodes: undefined,
    pageInfo: undefined,
  };
  const [selected, setSelected] = useState(0);
  const [cursor, setCursor] = useState<
    { cursor: string; variant: "before" | "after" } | undefined
  >(undefined);
  const sortOptions: IndexFiltersProps["sortOptions"] = [
    {
      label: "Items count",
      value: "TOTAL_ITEMS_QUANTITY asc",
      directionLabel: "Ascending",
    },
    {
      label: "Items count",
      value: "TOTAL_ITEMS_QUANTITY desc",
      directionLabel: "Descending",
    },
    { label: "Date", value: "CREATED_AT asc", directionLabel: "Ascending" },
    { label: "Date", value: "CREATED_AT desc", directionLabel: "Descending" },
    {
      label: "Total price",
      value: "TOTAL_PRICE asc",
      directionLabel: "Ascending",
    },
    {
      label: "Total price",
      value: "TOTAL_PRICE desc",
      directionLabel: "Descending",
    },
  ];
  const [sortSelected, setSortSelected] = useState(["CREATED_AT asc"]);
  const [financialStatus, setFinancialStatus] = useState<string[] | undefined>(
    undefined
  );
  const date = new Date();
  const [{ month, year }, setDate] = useState({
    month: date.getMonth(),
    year: date.getFullYear(),
  });
  const [selectedDates, setSelectedDates] = useState(undefined);
  const [queryValue, setQueryValue] = useState("");
  const [manualSetup, setManualSetup] = useState(false);

  useEffect(() => {
    const _storage = handleStorageItems();
    if (_storage) setStorage(_storage);
  }, []);

  useEffect(() => {
    localStorage.setItem("storageAppOrders", JSON.stringify(storage));
    setItemStrings(storage.map((s) => s.filterName));
  }, [storage]);

  useEffect(() => {
    setManualSetup(true);
    const itemFromStorage = storage.find((s, i) => i === selected);
    setQueryValue(itemFromStorage.queryString);
    setSelectedDates(itemFromStorage.selectedDates);
    setSortSelected(itemFromStorage.sortSelected);
    setFinancialStatus(itemFromStorage.financialStatus);
    setManualSetup(false);
  }, [selected, storage, itemStrings]);

  useEffect(() => {
    if (!manualSetup) {
      const params = getAllParams();
      onRequest(params);
    }
  }, [cursor, sortSelected, selected, manualSetup]);

  const deleteView = (index: number) => {
    // const newItemStrings = [...itemStrings];
    // newItemStrings.splice(index, 1);
    // setItemStrings(newItemStrings);
    setStorage((prev) => {
      const prevStorage = [...prev];
      prevStorage.splice(index, 1);
      return prevStorage;
    });
    setSelected(0);
  };

  const duplicateView = async (name: string) => {
    // setItemStrings([...itemStrings, name]);
    // setSelected(itemStrings.length);
    setStorage((prev) => {
      const prevStorage = [...prev];
      prevStorage.push({
        filterName: name,
        sortSelected,
        selectedDates,
        financialStatus,
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
    // setItemStrings([...itemStrings, value]);
    // setSelected(itemStrings.length);
    setStorage((prev) => {
      const prevStorage = [...prev];
      prevStorage.push({
        filterName: value,
        sortSelected,
        selectedDates,
        financialStatus,
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
          prevStorageItem.financialStatus = financialStatus;
          prevStorageItem.selectedDates = selectedDates;
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

  const handleFinancialStatusChange = useCallback(
    (value: string[]) => setFinancialStatus(value),
    []
  );
  const handleMonthChange = useCallback(
    (month: number, year: number) => setDate({ month, year }),
    []
  );

  const handleFiltersQueryChange = useCallback(
    (value: string) => setQueryValue(value),
    []
  );
  const handleFinancialStatusRemove = useCallback(
    () => setFinancialStatus(undefined),
    []
  );

  const handleDateValueRemove = useCallback(() => {
    setDate({ month: date.getMonth(), year: date.getFullYear() });
    setSelectedDates({ start: date, end: date });
  }, []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleFiltersClearAll = useCallback(() => {
    handleFinancialStatusRemove();
    handleQueryValueRemove();
    handleDateValueRemove();
  }, [
    handleDateValueRemove,
    handleFinancialStatusRemove,
    handleQueryValueRemove,
  ]);

  const filters = [
    {
      key: "financialStatus",
      label: "Status like",
      filter: (
        <ChoiceList
          title="Financial Status"
          titleHidden
          choices={[
            { label: "PENDING", value: E_STATUS.PENDING },
            { label: "AUTHORIZED", value: E_STATUS.AUTHORIZED },
            { label: "PARTIALLY_PAID", value: E_STATUS.PARTIALLY_PAID },
            { label: "PARTIALLY_REFUNDED", value: E_STATUS.PARTIALLY_REFUNDED },
            { label: "VOIDED", value: E_STATUS.VOIDED },
            { label: "PAID", value: E_STATUS.PAID },
            { label: "REFUNDED", value: E_STATUS.REFUNDED },
            { label: "EXPIRED", value: E_STATUS.EXPIRED },
          ]}
          selected={financialStatus || []}
          onChange={handleFinancialStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "dateRange",
      label: "Date range",
      filter: (
        <DatePicker
          month={month}
          year={year}
          onChange={setSelectedDates}
          onMonthChange={handleMonthChange}
          selected={selectedDates}
          multiMonth
          allowRange
        />
      ),
      shortcut: true,
    },
  ];

  const appliedFilters: IndexFiltersProps["appliedFilters"] = [];
  if (financialStatus && !isEmpty(financialStatus)) {
    const key = "financialStatus";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, financialStatus),
      onRemove: handleFinancialStatusRemove,
    });
  }
  if (selectedDates) {
    const key = "dateRange";
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, [selectedDates.start, selectedDates.end]),
      onRemove: handleDateValueRemove,
    });
  }

  const resourceName = {
    singular: "order",
    plural: "orders",
  };

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

    return nodes?.map((o: any, index: number) => {
      const address =
        o.displayAddress && o.displayAddress.formatted
          ? o.displayAddress.formatted.toReversed().join(", ")
          : "";
      return (
        <IndexTable.Row id={o.id} key={o.id} position={index}>
          <IndexTable.Cell>
            <Text variant="bodyMd" fontWeight="bold" as="span">
              <Link to={`/orders/${o.id.split("/").at(-1)}`}>{o.name}</Link>
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as={"h3"} alignment={"center"}>
              $ {o.totalPriceSet?.shopMoney?.amount}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as={"h3"} alignment={"center"}>
              {o.subtotalLineItemsQuantity}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Box maxWidth={"250px"}>
              <Tooltip content={address} active={address.length > 40}>
                <Text as={"h3"} truncate breakWord alignment={"start"}>
                  {address}
                </Text>
              </Tooltip>
            </Box>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Tooltip content={moment(o.createdAt).format("MM-DD-yyyy HH:mm")}>
              <Text as={"h3"} alignment={"center"}>
                {moment(o.createdAt).format("MM-DD-yyyy")}
              </Text>
            </Tooltip>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <FinancialStatus status={o.displayFinancialStatus} />
          </IndexTable.Cell>
        </IndexTable.Row>
      );
    });
  }, [data]);

  const getAllParams = useCallback(() => {
    const _sortData = sortSelected.at(-1).split(" ");
    const query: string[] = [];

    const name = queryValue;
    const dates = selectedDates;

    if (name) query.push(`name:${name}*`);
    if (dates)
      query.push(
        `createdAt:>=${dates.start.toISOString()} createdAt:<=${dates.end.toISOString()}`
      );

    return {
      sort: _sortData.at(0),
      reverse: _sortData.at(-1) !== "asc",
      first: 10,
      after: cursor?.variant === "after" ? cursor.cursor : undefined,
      before: cursor?.variant === "before" ? cursor.cursor : undefined,
      query: query.length > 0 ? query.join(" ") : undefined,
    } as I_OrdersGetDto;
  }, [sortSelected, queryValue, cursor, selected, selectedDates]);

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
          loading={isLoading}
        />
        <IndexTable
          selectable={false}
          // loading={isLoading}
          headings={headings}
          hasZebraStriping={true}
          resourceName={resourceName}
          itemCount={data?.data?.orders?.nodes?.length ?? 0}
        >
          {rowMarkup()}
          <tr className={cl.pagination}>
            <td colSpan={6} align={"center"}>
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

export default OrdersTable;
