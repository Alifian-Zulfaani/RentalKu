<template>
  <div class="password-field">
    <label :for="inputId">{{ label }}</label>
    <span class="password-control">
      <input
        :id="inputId"
        :value="modelValue"
        :type="visible ? 'text' : 'password'"
        :autocomplete="autocomplete"
        :minlength="minlength"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? errorId : undefined"
        required
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <button
        type="button"
        :aria-label="
          visible
            ? `Sembunyikan ${label.toLowerCase()}`
            : `Tampilkan ${label.toLowerCase()}`
        "
        :aria-pressed="visible"
        @click="visible = !visible"
      >
        <EyeOff v-if="visible" :size="18" /><Eye v-else :size="18" />
      </button>
    </span>
    <small
      v-if="error"
      :id="errorId"
      class="password-field-error"
      role="alert"
      >{{ error }}</small
    >
  </div>
</template>

<script setup>
import { ref, useId } from "vue";
import { Eye, EyeOff } from "lucide-vue-next";
defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, required: true },
  autocomplete: { type: String, required: true },
  minlength: { type: Number, default: undefined },
  error: { type: String, default: "" },
});
defineEmits(["update:modelValue"]);
const visible = ref(false);
const inputId = useId();
const errorId = `${inputId}-error`;
</script>
