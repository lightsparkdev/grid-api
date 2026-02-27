'use client';

import * as React from 'react';
import { Form as BaseForm } from '@base-ui/react/form';
import clsx from 'clsx';
import styles from './Form.module.scss';

export interface FormProps extends BaseForm.Props {}

export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  function Form(props, ref) {
    const { className, ...other } = props;

    return (
      <BaseForm
        ref={ref}
        className={clsx(styles.form, className)}
        {...other}
      />
    );
  }
);

if (process.env.NODE_ENV !== 'production') {
  Form.displayName = 'Form';
}

export default Form;
