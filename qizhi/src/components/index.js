import zButtons from "./z-buttons.vue";
import zDate from "./z-date.vue";
import zInput from "./z-input.vue";
import zSelect from "./z-select.vue";
import zArea from "./z-area.vue";
import zJob from "./z-job.vue";
import zUpload from './z-upload.vue';

export default {
  'z-text': zInput,
  'z-password': zInput,
  'z-phone': zInput,
  'z-email': zInput,
  'z-idcard': zInput,
  'z-idNumber': zInput,
  'z-percent': zInput,
  'z-button': zButtons,
  'z-date': zDate,
  'z-datePeriod': zDate,
  'z-select': zSelect,
  'z-bank': zSelect,
  'z-area': zArea,
  'z-job': zJob,
  'z-upload': zUpload
}