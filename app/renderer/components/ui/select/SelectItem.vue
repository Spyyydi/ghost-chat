<script setup lang="ts">
import type { SelectItemProps } from 'radix-vue';
import type { HTMLAttributes } from 'vue';

import { CheckIcon } from '@radix-icons/vue';
import {
    SelectItem,
    SelectItemIndicator,

    SelectItemText,
    useForwardProps,
} from 'radix-vue';
import { computed } from 'vue';

import { cn } from '#lib//utils/cn';

const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = computed(() => {
    const { class: _, ...delegated } = props;

    return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
    <SelectItem
        v-bind="forwardedProps"
        :class="
            cn(
                'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                props.class,
            )
        "
    >
        <span class="absolute right-2 flex size-3.5 items-center justify-center">
            <SelectItemIndicator>
                <CheckIcon class="size-4" />
            </SelectItemIndicator>
        </span>

        <SelectItemText>
            <slot />
        </SelectItemText>
    </SelectItem>
</template>
