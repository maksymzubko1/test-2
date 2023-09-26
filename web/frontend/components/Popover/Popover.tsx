import {Button, Popover, ActionListItemDescriptor, Badge, VerticalStack, Box} from '@shopify/polaris';
import {useState, useCallback} from 'react';

interface I_Props {
    items: ActionListItemDescriptor[];
    text: string;
}

export function PopoverWithActionList({text, items}: I_Props) {
    const [popoverActive, setPopoverActive] = useState(false);

    const setPopoverOpen = useCallback(
        () => setPopoverActive(true),
        [],
    );

    const setPopoverClose = useCallback(
        () => setPopoverActive(false),
        [],
    );

    const activator = (
        <Button onClick={setPopoverOpen} disclosure={"down"} size={"slim"}>
            {text}
        </Button>
    );

    return (
        <Popover
            active={popoverActive}
            activator={activator}
            autofocusTarget="first-node"
            onClose={setPopoverClose}
        >
            <Box padding={"3"}>
                <VerticalStack gap={"1"}>
                    {items.map(i => (<Badge progress={i.active ? 'complete' : 'incomplete'} children={i.content}
                                            status={"read-only-experimental"}/>))}
                </VerticalStack>
            </Box>
        </Popover>
    );
}