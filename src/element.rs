use super::*;
use lol_html::html_content::Element as NativeElement;

#[wasm_bindgen]
pub struct Element(NativeRefWrap<NativeElement<'static, 'static>>);

impl_from_native!(NativeElement --> Element);

#[wasm_bindgen]
impl Element {
    #[wasm_bindgen(method, js_name=setAttribute)]
    pub fn set_attribute(&mut self, name: &str, value: &str) -> JsResult<()> {
        self.0
            .get_mut()?
            .set_attribute(name, value)
            .into_js_result()
    }
}
