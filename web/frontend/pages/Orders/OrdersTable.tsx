import React, {useCallback, useEffect, useState} from 'react';
import {NonEmptyArray} from "@shopify/polaris/build/ts/src/types";
import {IndexTableHeading} from "@shopify/polaris/build/ts/src/components/IndexTable";
import {
    ChoiceList, DatePicker,
    Frame, Grid,
    IndexFilters,
    IndexFiltersProps,
    IndexTable,
    LegacyCard, Pagination,
    RangeSlider,
    TabProps,
    Text,
    TextField,
    useSetIndexFiltersMode
} from "@shopify/polaris";
import {Link} from "react-router-dom";
import {I_OrdersGetDto} from "../../graphql/orders.interfaces";
import cl from './style.module.css'
import moment from "moment";

const headings: NonEmptyArray<IndexTableHeading> = [
    {title: "Order", alignment: "start"},
    {title: "Total Price", alignment: "center"},
    {title: "Items Count", alignment: "center"},
    {title: "Address", alignment: "start"},
    {title: "Created Date", alignment: "center"}
]

function disambiguateLabel(key: string, value: string | any[]): string {
    switch (key) {
        case 'dateRange':
            const datesEquals = moment(value[0]).isSame(value[1]);
            if (datesEquals)
                return `Date equal ${moment().format("MM-DD-yyyy")}`
            return `Date range is between ${moment().format("MM-DD-yyyy")} and ${moment(value[1]).format("MM-DD-yyyy")}`;
        case 'financialStatus':
            return `Status like ${(value as string[]).map((val) => ` ${val}`).join(', ')}`;
        default:
            return value as string;
    }
}

function isEmpty(value: string | string[]): boolean {
    if (Array.isArray(value)) {
        return value.length === 0;
    } else {
        return value === '' || value == null;
    }
}

interface I_Props {
    data: any,
    isLoading: boolean,
    onRequest: (options: I_OrdersGetDto) => void;
}

const OrdersTable = ({data, isLoading, onRequest}: I_Props) => {
    const [itemStrings, setItemStrings] = useState([
        'All'
    ]);
    const deleteView = (index: number) => {
        const newItemStrings = [...itemStrings];
        newItemStrings.splice(index, 1);
        setItemStrings(newItemStrings);
        setSelected(0);
    };
    const {nodes, pageInfo} = data?.data?.orders ?? {nodes: undefined, pageInfo: undefined};

    const duplicateView = async (name: string) => {
        setItemStrings([...itemStrings, name]);
        setSelected(itemStrings.length);
        return true;
    };

    const tabs: TabProps[] = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => {
        },
        id: `${item}-${index}`,
        isLocked: index === 0,
        actions:
            index === 0
                ? []
                : [
                    {
                        type: 'rename',
                        onAction: () => {
                        },
                        onPrimaryAction: async (value: string): Promise<boolean> => {
                            const newItemsStrings = tabs.map((item, idx) => {
                                if (idx === index) {
                                    return value;
                                }
                                return item.content;
                            });
                            setItemStrings(newItemsStrings);
                            return true;
                        },
                    },
                    {
                        type: 'duplicate',
                        onPrimaryAction: async (value: string): Promise<boolean> => {
                            duplicateView(value);
                            return true;
                        },
                    },
                    {
                        type: 'edit',
                    },
                    {
                        type: 'delete',
                        onPrimaryAction: async () => {
                            deleteView(index);
                            return true;
                        },
                    },
                ],
    }));
    const [selected, setSelected] = useState(0);
    const [cursor, setCursor] = useState<{ cursor: string, variant: "before" | "after" } | undefined>(undefined)

    const handleSelect = (e: number) => {
        console.log('request ', e)
        // send request
        setSelected(e)
    }

    const onCreateNewView = async (value: string) => {
        setItemStrings([...itemStrings, value]);
        setSelected(itemStrings.length);
        return true;
    };
    const sortOptions: IndexFiltersProps['sortOptions'] = [
        {label: 'Items count', value: 'TOTAL_ITEMS_QUANTITY asc', directionLabel: 'Ascending'},
        {label: 'Items count', value: 'TOTAL_ITEMS_QUANTITY desc', directionLabel: 'Descending'},
        {label: 'Date', value: 'CREATED_AT asc', directionLabel: 'Ascending'},
        {label: 'Date', value: 'CREATED_AT desc', directionLabel: 'Descending'},
        {label: 'Total price', value: 'TOTAL_PRICE asc', directionLabel: 'Ascending'},
        {label: 'Total price', value: 'TOTAL_PRICE desc', directionLabel: 'Descending'},
    ];
    const [sortSelected, setSortSelected] = useState(['CREATED_AT asc']);

    const handleSort = (e: string[]) => {
        console.log('request ', e)
        // send request
        setSortSelected(e);
    }

    const {mode, setMode} = useSetIndexFiltersMode();
    const onHandleCancel = () => {
    };

    const onHandleSave = async () => {
        console.log('request on save')
        // send request
        const params = getAllParams();
        onRequest(params);
        return true;
    };

    const primaryAction: IndexFiltersProps['primaryAction'] =
        selected === 0
            ? {
                type: 'save-as',
                onAction: onCreateNewView,
                disabled: false,
                loading: false,
            }
            : {
                type: 'save',
                onAction: onHandleSave,
                disabled: false,
                loading: false,
            };
    const [financialStatus, setFinancialStatus] = useState<string[] | undefined>(
        undefined,
    );
    const date = new Date();
    const [{month, year}, setDate] = useState({month: date.getMonth(), year: date.getFullYear()});
    const [selectedDates, setSelectedDates] = useState(undefined);
    const [queryValue, setQueryValue] = useState('');

    const handleFinancialStatusChange = useCallback(
        (value: string[]) => setFinancialStatus(value),
        [],
    );
    const handleMonthChange = useCallback(
        (month: number, year: number) => setDate({month, year}),
        [],
    );

    const handleFiltersQueryChange = useCallback(
        (value: string) => setQueryValue(value),
        [],
    );
    const handleFinancialStatusRemove = useCallback(
        () => setFinancialStatus(undefined),
        [],
    );

    const handleDateValueRemove = useCallback(() => {
        setDate({month: date.getMonth(), year: date.getFullYear()});
        setSelectedDates({start: date, end: date})
    }, []);
    const handleQueryValueRemove = useCallback(() => setQueryValue(''), []);
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
            key: 'financialStatus',
            label: 'Status like',
            filter: (
                <ChoiceList
                    title="Financial Status"
                    titleHidden
                    choices={[
                        {label: 'PENDING', value: 'pending'},
                        {label: 'AUTHORIZED', value: 'authorized'},
                        {label: 'PARTIALLY_PAID', value: 'partially_paid'},
                        {label: 'PARTIALLY_REFUNDED', value: 'partially_refunded'},
                        {label: 'VOIDED', value: 'voided'},
                        {label: 'PAID', value: 'paid'},
                        {label: 'REFUNDED', value: 'refunded'},
                        {label: 'EXPIRED', value: 'expired'},
                    ]}
                    selected={financialStatus || []}
                    onChange={handleFinancialStatusChange}
                    allowMultiple
                />
            ),
            shortcut: true,
        },
        {
            key: 'dateRange',
            label: 'Date range',
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

    const appliedFilters: IndexFiltersProps['appliedFilters'] = [];
    if (financialStatus && !isEmpty(financialStatus)) {
        const key = 'financialStatus';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, financialStatus),
            onRemove: handleFinancialStatusRemove,
        });
    }
    if (selectedDates) {
        const key = 'dateRange';
        appliedFilters.push({
            key,
            label: disambiguateLabel(key, [selectedDates.start, selectedDates.end]),
            onRemove: handleDateValueRemove,
        });
    }

    const resourceName = {
        singular: 'order',
        plural: 'orders',
    };

    const rowMarkup = useCallback(() => {
        if (!data || nodes?.length === 0)
            return <IndexTable.Row id={"0"} position={0}>
                <Text variant="bodyLg" fontWeight="bold" as="span" alignment={"center"}>
                    No data found!
                </Text>
            </IndexTable.Row>

        return nodes?.map(
            (o: any, index: number) => (
                <IndexTable.Row id={o.id} key={o.id} position={index}>
                    <IndexTable.Cell>
                        <Text variant="bodyMd" fontWeight="bold" as="span">
                            <Link to={`/orders/${o.id.split('/').at(-1)}`}>{o.name}</Link>
                        </Text>
                    </IndexTable.Cell>
                    <IndexTable.Cell><Text as={"h3"} alignment={"center"}>$ {o.totalPrice}</Text></IndexTable.Cell>
                    <IndexTable.Cell><Text as={"h3"}
                                           alignment={"center"}>{o.subtotalLineItemsQuantity}</Text></IndexTable.Cell>
                    <IndexTable.Cell><Text as={"h3"}
                                           alignment={"start"}>{o.displayAddress && o.displayAddress.formatted ? o.displayAddress.formatted.toReversed().join(', ') : ""}</Text></IndexTable.Cell>
                    <IndexTable.Cell><Text as={"h3"}
                        /*@ts-ignore*/
                                           alignment={"center"}>{new Date(o.createdAt).toLocaleDateString({}, {dateStyle: "short"})}</Text></IndexTable.Cell>
                </IndexTable.Row>
            )
        );
    }, [data]);

    const getAllParams = useCallback(() => {
        const _sortData = sortSelected.at(-1).split(' ');
        let query: string[] = [];

        const name = queryValue;
        const dates = selectedDates;

        if (!!name)
            query.push(`name:${name}*`);
        if (!!dates)
            query.push(`createdAt:>=${dates.start.toISOString()} createdAt:<=${dates.end.toISOString()}`);

        return {
            sort: _sortData.at(0),
            reverse: _sortData.at(-1) !== 'asc',
            first: 10,
            after: cursor?.variant === 'after' ? cursor.cursor : undefined,
            before: cursor?.variant === 'before' ? cursor.cursor : undefined,
            query: query.length > 0 ? query.join(" ") : undefined
        } as I_OrdersGetDto
    }, [sortSelected, queryValue, cursor, selected, selectedDates]);

    useEffect(() => {
        console.log(sortSelected)
        const params = getAllParams();
        onRequest(params);
    }, [cursor, sortSelected, selected]);

    const handleNext = () => {
        setCursor({cursor: pageInfo?.endCursor, variant: "after"})
    }

    const handlePrevious = () => {
        setCursor({cursor: pageInfo?.startCursor, variant: "before"})
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
                    onQueryClear={() => {
                    }}
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
                        <td colSpan={5} align={"center"}>
                            <Pagination type={"table"} hasNext={pageInfo?.hasNextPage} hasPrevious={pageInfo?.hasPreviousPage}
                                        onNext={handleNext} onPrevious={handlePrevious}></Pagination>
                        </td>
                    </tr>
                </IndexTable>
            </LegacyCard>
        </Frame>
    );
};

export default OrdersTable;