import { useForm } from "react-hook-form";
import {
  EDIT_PROFILE_DEFAULTS,
  EDIT_PROFILE_LIMITS,
} from "../constants/editProfile";
import { EditProfileFormValues } from "../types";

export function useEditProfileForm(initial?: Partial<EditProfileFormValues>) {
  const form = useForm<EditProfileFormValues>({
    defaultValues: { ...EDIT_PROFILE_DEFAULTS, ...initial },
    mode: "onChange",
  });

  return {
    ...form,
    limits: EDIT_PROFILE_LIMITS,
    submit: form.handleSubmit,
  };
}
