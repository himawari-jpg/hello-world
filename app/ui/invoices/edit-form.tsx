'use client';

import { CustomerField, InvoiceForm } from '@/app/lib/definitions';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/app/ui/button';
import { updateInvoice, State } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function EditInvoiceForm({
  invoice,
  customers,
}: {
  invoice: InvoiceForm;
  customers: CustomerField[];
}) {
  const initialState: State = { message: null, errors: {} };
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);
  const [state, formAction] = useActionState(updateInvoiceWithId, initialState);

  // ヘルパー関数：エラーを安全に取得
  const renderErrors = (key: string) => {
    return state.errors?.[key]?.map((error: string, idx: number) => (
      <p className="mt-2 text-sm text-red-500" key={idx}>
        {error}
      </p>
    ));
  };
return(

<form action={formAction} noValidate>
  {/* Customer */}
  <div>
    <label htmlFor="customer">Choose customer</label>
    <select
      id="customer"
      name="customerId"
      aria-describedby="customer-error"
      defaultValue={invoice.customer_id || ''}
    >
      <option value="" disabled>Select a customer</option>
      {customers.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
    <div id="customer-error" aria-live="polite" aria-atomic="true">
      {state.errors?.customerId?.map((e,i) => <p key={i}>{e}</p>)}
    </div>
  </div>

  {/* Amount */}
  <div>
    <label htmlFor="amount">Amount</label>
    <input
      id="amount"
      name="amount"
      type="number"
      step="0.01"
      defaultValue={invoice.amount || ''}
      aria-describedby="amount-error"
    />
    <div id="amount-error" aria-live="polite" aria-atomic="true">
      {state.errors?.amount?.map((e,i) => <p key={i}>{e}</p>)}
    </div>
  </div>

  {/* Status */}
  <fieldset aria-describedby="status-error">
    <legend>Status</legend>
    <input type="radio" id="pending" name="status" value="pending" defaultChecked={invoice.status==='pending'} />
    <label htmlFor="pending">Pending</label>
    <input type="radio" id="paid" name="status" value="paid" defaultChecked={invoice.status==='paid'} />
    <label htmlFor="paid">Paid</label>
    <div id="status-error" aria-live="polite" aria-atomic="true">
      {state.errors?.status?.map((e,i) => <p key={i}>{e}</p>)}
    </div>
  </fieldset>

  {/* フォーム全体のエラーメッセージ */}
  <div aria-live="polite" aria-atomic="true">
    {state.message && <p>{state.message}</p>}
  </div>

  <button type="submit">Update Invoice</button>
</form>
  );
}