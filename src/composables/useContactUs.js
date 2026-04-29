import { reactive, ref } from "vue";
import APIService from "@/api/APIService";

function createDefaultForm() {
  return {
    firstName: "",
    lastName: "",
    email: "",
    inquiryTypes: [],
    message: "",
  };
}

export function useContactUs() {
  const showContactModal = ref(false);
  const isSubmitting = ref(false);
  const submitSuccessMessage = ref("");
  const submitErrorMessage = ref("");
  const categoryError = ref(false);

  const contactForm = reactive(createDefaultForm());

  function clearFormFields() {
    contactForm.firstName = "";
    contactForm.lastName = "";
    contactForm.email = "";
    contactForm.inquiryTypes = [];
    contactForm.message = "";
  }

  function resetMessages() {
    categoryError.value = false;
    submitErrorMessage.value = "";
    submitSuccessMessage.value = "";
  }

  function resetForm() {
    clearFormFields();
    resetMessages();
  }

  function openContactModal() {
    resetForm();
    showContactModal.value = true;
  }

  function closeContactModal() {
    if (isSubmitting.value) return;
    showContactModal.value = false;
  }

  async function submitContactForm() {
    resetMessages();

    if (!contactForm.inquiryTypes.length) {
      categoryError.value = true;
      return;
    }

    isSubmitting.value = true;

    try {
      await APIService.sendContactUsEmail({
        firstName: contactForm.firstName,
        lastName: contactForm.lastName,
        email: contactForm.email,
        inquiryTypes: [...contactForm.inquiryTypes],
        message: contactForm.message,
      });

      submitSuccessMessage.value =
        "Your message has been sent. A confirmation email has also been sent to you.";

      clearFormFields();

      setTimeout(() => {
        showContactModal.value = false;
      }, 1500);
    } catch (error) {
      submitErrorMessage.value =
        error?.message || "Unable to send your message right now.";
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    showContactModal,
    isSubmitting,
    submitSuccessMessage,
    submitErrorMessage,
    categoryError,
    contactForm,
    resetForm,
    openContactModal,
    closeContactModal,
    submitContactForm,
  };
}