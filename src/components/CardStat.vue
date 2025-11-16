<template>
  <div :class="['p-4 sm:p-5 rounded-xl shadow-lg w-full', bgColorClass]">
    <div class="flex items-center space-x-3">
      <div :class="['p-3 rounded-full flex-shrink-0', iconBgClass]">
        <span class="text-xl font-bold">{{ icon }}</span>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-500">{{ title }}</p>
        <p
          :class="['mt-1 text-2xl sm:text-3xl font-semibold', valueColorClass]"
        >
          {{ value }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: String,
  value: [String, Number],
  icon: String,
  color: {
    type: String,
    default: "indigo",
  },
});

const bgColorClass = computed(() => {
  return `bg-white border-l-4 border-${props.color}-500`;
});

const iconBgClass = computed(() => {
  return `bg-${props.color}-100 text-${props.color}-700`;
});

const valueColorClass = computed(() => {
  return `text-${props.color}-900`;
});
</script>
