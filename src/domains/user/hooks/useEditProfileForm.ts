import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  EDIT_PROFILE_DEFAULTS,
  EDIT_PROFILE_LIMITS,
} from "../constants/editProfile";
import { EditProfileFormValues } from "../types";

export function useEditProfileForm(initial?: Partial<EditProfileFormValues>) {
  const defaultValues = useMemo(
    () => ({ ...EDIT_PROFILE_DEFAULTS, ...initial }),
    [initial]
  );
  const form = useForm<EditProfileFormValues>({
    defaultValues,
    mode: "onChange",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return {
    ...form,
    limits: EDIT_PROFILE_LIMITS,
    submit: form.handleSubmit,
  };
}
