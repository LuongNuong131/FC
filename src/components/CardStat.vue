<template>
  <div
    :class="[
      'group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer',
      'border-l-4',
      bgColorClass,
    ]"
  >
    <!-- Animated Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div
        class="absolute top-0 right-0 w-32 h-32 rounded-full mix-blend-overlay filter blur-2xl group-hover:scale-150 transition-transform duration-700"
        :class="`bg-${color}-400`"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-24 h-24 rounded-full mix-blend-overlay filter blur-2xl group-hover:scale-150 transition-transform duration-700"
        :class="`bg-${color}-300`"
        style="animation-delay: 0.3s"
      ></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 p-6">
      <div class="flex items-center justify-between mb-4">
        <!-- Icon with Glow Effect -->
        <div
          :class="[
            'relative p-4 rounded-xl shadow-lg transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110',
            iconBgClass,
          ]"
        >
          <!-- Glow effect -->
          <div
            :class="`absolute inset-0 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity bg-${color}-400`"
          ></div>

          <!-- Icon -->
          <span class="relative text-3xl font-bold block">{{ icon }}</span>
        </div>

        <!-- Trend Indicator -->
        <div v-if="trend" class="flex flex-col items-end">
          <div
            :class="[
              'flex items-center px-2 py-1 rounded-full text-xs font-bold',
              trendUp
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700',
            ]"
          >
            <svg
              v-if="trendUp"
              class="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <svg
              v-else
              class="w-3 h-3 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="3"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            {{ trend }}
          </div>
        </div>
      </div>

      <!-- Title -->
      <p class="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">
        {{ title }}
      </p>

      <!-- Value with Animation -->
      <div class="flex items-baseline space-x-2">
        <p
          :class="[
            'text-4xl font-black transition-all duration-300 group-hover:scale-110',
            valueColorClass,
          ]"
        >
          {{ displayValue }}
        </p>

        <!-- Suffix if any -->
        <span v-if="suffix" class="text-lg font-semibold text-gray-400">
          {{ suffix }}
        </span>
      </div>

      <!-- Description -->
      <p v-if="description" class="mt-2 text-xs text-gray-500">
        {{ description }}
      </p>

      <!-- Progress Bar (optional) -->
      <div v-if="showProgress && maxValue" class="mt-4">
        <div
          class="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1"
        >
          <span>Tiến độ</span>
          <span>{{ progressPercentage }}%</span>
        </div>
        <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            :class="`h-full bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-full transition-all duration-1000 ease-out`"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Sparkle Effect on Hover -->
      <div
        class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <svg
          class="w-6 h-6 text-yellow-400 animate-pulse"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      </div>
    </div>

    <!-- Bottom Shine Effect -->
    <div
      class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      :class="`from-${color}-400 via-${color}-500 to-${color}-600`"
    ></div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  value: {
    type: [String, Number],
    required: true,
  },
  icon: {
    type: String,
    default: "📊",
  },
  color: {
    type: String,
    default: "indigo",
    validator: (value) =>
      [
        "indigo",
        "blue",
        "green",
        "yellow",
        "red",
        "purple",
        "pink",
        "gray",
        "orange",
      ].includes(value),
  },
  trend: {
    type: String,
    default: null,
  },
  suffix: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    default: null,
  },
  showProgress: {
    type: Boolean,
    default: false,
  },
  maxValue: {
    type: Number,
    default: null,
  },
});

// Computed Properties
const bgColorClass = computed(() => {
  return `bg-white border-${props.color}-500`;
});

const iconBgClass = computed(() => {
  return `bg-gradient-to-br from-${props.color}-100 to-${props.color}-200 text-${props.color}-700`;
});

const valueColorClass = computed(() => {
  return `text-${props.color}-600`;
});

const trendUp = computed(() => {
  if (!props.trend) return true;
  return props.trend.startsWith("+");
});

const displayValue = computed(() => {
  // Add animation to numbers
  if (typeof props.value === "number") {
    return props.value.toLocaleString("vi-VN");
  }
  return props.value;
});

const progressPercentage = computed(() => {
  if (!props.showProgress || !props.maxValue) return 0;
  const numValue =
    typeof props.value === "number"
      ? props.value
      : parseFloat(props.value) || 0;
  return Math.min(Math.round((numValue / props.maxValue) * 100), 100);
});
</script>

<style scoped>
/* Ensure Tailwind dynamic classes are available */
.bg-indigo-100 {
  background-color: rgb(224 231 255);
}
.bg-indigo-200 {
  background-color: rgb(199 210 254);
}
.bg-indigo-400 {
  background-color: rgb(129 140 248);
}
.bg-indigo-500 {
  background-color: rgb(99 102 241);
}
.bg-indigo-600 {
  background-color: rgb(79 70 229);
}
.text-indigo-600 {
  color: rgb(79 70 229);
}
.text-indigo-700 {
  color: rgb(67 56 202);
}
.border-indigo-500 {
  border-color: rgb(99 102 241);
}

.bg-blue-100 {
  background-color: rgb(219 234 254);
}
.bg-blue-200 {
  background-color: rgb(191 219 254);
}
.bg-blue-400 {
  background-color: rgb(96 165 250);
}
.bg-blue-500 {
  background-color: rgb(59 130 246);
}
.bg-blue-600 {
  background-color: rgb(37 99 235);
}
.text-blue-600 {
  color: rgb(37 99 235);
}
.text-blue-700 {
  color: rgb(29 78 216);
}
.border-blue-500 {
  border-color: rgb(59 130 246);
}

.bg-green-100 {
  background-color: rgb(220 252 231);
}
.bg-green-200 {
  background-color: rgb(187 247 208);
}
.bg-green-400 {
  background-color: rgb(74 222 128);
}
.bg-green-500 {
  background-color: rgb(34 197 94);
}
.bg-green-600 {
  background-color: rgb(22 163 74);
}
.text-green-600 {
  color: rgb(22 163 74);
}
.text-green-700 {
  color: rgb(21 128 61);
}
.border-green-500 {
  border-color: rgb(34 197 94);
}

.bg-yellow-100 {
  background-color: rgb(254 249 195);
}
.bg-yellow-200 {
  background-color: rgb(254 240 138);
}
.bg-yellow-400 {
  background-color: rgb(250 204 21);
}
.bg-yellow-500 {
  background-color: rgb(234 179 8);
}
.bg-yellow-600 {
  background-color: rgb(202 138 4);
}
.text-yellow-600 {
  color: rgb(202 138 4);
}
.text-yellow-700 {
  color: rgb(161 98 7);
}
.border-yellow-500 {
  border-color: rgb(234 179 8);
}

.bg-purple-100 {
  background-color: rgb(243 232 255);
}
.bg-purple-200 {
  background-color: rgb(233 213 255);
}
.bg-purple-400 {
  background-color: rgb(192 132 252);
}
.bg-purple-500 {
  background-color: rgb(168 85 247);
}
.bg-purple-600 {
  background-color: rgb(147 51 234);
}
.text-purple-600 {
  color: rgb(147 51 234);
}
.text-purple-700 {
  color: rgb(126 34 206);
}
.border-purple-500 {
  border-color: rgb(168 85 247);
}

.bg-red-100 {
  background-color: rgb(254 226 226);
}
.bg-red-200 {
  background-color: rgb(254 202 202);
}
.bg-red-400 {
  background-color: rgb(248 113 113);
}
.bg-red-500 {
  background-color: rgb(239 68 68);
}
.bg-red-600 {
  background-color: rgb(220 38 38);
}
.text-red-600 {
  color: rgb(220 38 38);
}
.text-red-700 {
  color: rgb(185 28 28);
}
.border-red-500 {
  border-color: rgb(239 68 68);
}

.bg-pink-100 {
  background-color: rgb(252 231 243);
}
.bg-pink-200 {
  background-color: rgb(251 207 232);
}
.bg-pink-400 {
  background-color: rgb(244 114 182);
}
.bg-pink-500 {
  background-color: rgb(236 72 153);
}
.bg-pink-600 {
  background-color: rgb(219 39 119);
}
.text-pink-600 {
  color: rgb(219 39 119);
}
.text-pink-700 {
  color: rgb(190 24 93);
}
.border-pink-500 {
  border-color: rgb(236 72 153);
}

/* Gradient classes */
.from-indigo-400 {
  --tw-gradient-from: rgb(129 140 248);
}
.to-indigo-600 {
  --tw-gradient-to: rgb(79 70 229);
}
.from-blue-400 {
  --tw-gradient-from: rgb(96 165 250);
}
.to-blue-600 {
  --tw-gradient-to: rgb(37 99 235);
}
.from-green-400 {
  --tw-gradient-from: rgb(74 222 128);
}
.to-green-600 {
  --tw-gradient-to: rgb(22 163 74);
}
.from-yellow-400 {
  --tw-gradient-from: rgb(250 204 21);
}
.to-yellow-600 {
  --tw-gradient-to: rgb(202 138 4);
}
.from-purple-400 {
  --tw-gradient-from: rgb(192 132 252);
}
.to-purple-600 {
  --tw-gradient-to: rgb(147 51 234);
}
.from-red-400 {
  --tw-gradient-from: rgb(248 113 113);
}
.to-red-600 {
  --tw-gradient-to: rgb(220 38 38);
}
.from-pink-400 {
  --tw-gradient-from: rgb(244 114 182);
}
.to-pink-600 {
  --tw-gradient-to: rgb(219 39 119);
}

/* Animation */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
