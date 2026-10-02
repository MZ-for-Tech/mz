export type MeasurementEvent = 'service_view' | 'case_study_view' | 'contact_cta_click' | 'contact_form_start' | 'contact_form_success' | 'contact_form_error' | 'product_outbound_click';

// A local event interface only. An owner-approved, consent-aware adapter must
// subscribe before anything is stored or sent to an analytics provider.
export function measure(name: MeasurementEvent, path: string, slug?: string) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('mz:measurement', { detail: {
    name, path: path.split(/[?#]/)[0], ...(slug ? { slug } : {}),
  } }));
}
