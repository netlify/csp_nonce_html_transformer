use super::element::Element;
use super::*;
use js_sys::Function as JsFunction;
use lol_html::ElementContentHandlers as NativeElementContentHandlers;
use std::mem;
use std::rc::Rc;
use thiserror::Error;

// NOTE: Display is noop, because we'll unwrap JSValue error when it will be propagated to
// `write()` or `end()`.
#[derive(Error, Debug)]
#[error("JS handler error")]
pub struct HandlerJsErrorWrap(pub JsValue);
// Probably horribly unsafe, but it works™
unsafe impl Send for HandlerJsErrorWrap {}
unsafe impl Sync for HandlerJsErrorWrap {}

macro_rules! make_handler {
    ($handler:ident, $JsArgType:ident, $this:ident) => {
        move |arg: &mut _| {
            let (js_arg, anchor) = $JsArgType::from_native(arg);
            let js_arg = JsValue::from(js_arg);

            let res = match $handler.call1(&$this, &js_arg) {
                Ok(_) => Ok(()),
                Err(e) => Err(HandlerJsErrorWrap(e).into()),
            };

            mem::drop(anchor);

            res
        }
    };
}
pub(crate) use make_handler;

pub trait IntoNativeHandlers<T> {
    fn into_native(self) -> T;
}

#[wasm_bindgen]
extern "C" {
    pub type ElementContentHandlers;

    #[wasm_bindgen(method, getter)]
    fn element(this: &ElementContentHandlers) -> Option<JsFunction>;
}

impl IntoNativeHandlers<NativeElementContentHandlers<'static>> for ElementContentHandlers {
    fn into_native(self) -> NativeElementContentHandlers<'static> {
        let handlers: Rc<JsValue> = Rc::new((&self).into());
        let mut native = NativeElementContentHandlers::default();

        if let Some(handler) = self.element() {
            let this = Rc::clone(&handlers);
            native = {
                #[inline(always)]
                fn type_hint<'h, T, H: lol_html::HandlerTypes>(h: T) -> T
                where
                    T: FnMut(
                            &mut lol_html::html_content::Element<'_, '_, H>,
                        ) -> lol_html::HandlerResult
                        + 'h,
                {
                    h
                }
                lol_html::ElementContentHandlers::default().element(
                    (type_hint(
                        (move |el: &mut _| {
                            let (js_arg, anchor) = Element::from_native(el);
                            let js_arg = JsValue::from(js_arg);
                            let res = match handler.call1(&this, &js_arg) {
                                Ok(_) => Ok(()),
                                Err(e) => Err(HandlerJsErrorWrap(e).into()),
                            };
                            mem::drop(anchor);
                            res
                        }),
                    )),
                )
            };
        }

        native
    }
}
