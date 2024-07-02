extern crate proc_macro;

use proc_macro::TokenStream;
use proc_macro2::{Ident, Span};
use quote::quote;
use syn::{parse_macro_input, DeriveInput};

#[proc_macro_derive(Partial)]
pub fn option_wrap(input: TokenStream) -> TokenStream {
    // Parse the input tokens into a syntax tree
    let ast = parse_macro_input!(input as DeriveInput);
    let name = &ast.ident;

    // Extract field names and types
    let fields = if let syn::Data::Struct(s) = &ast.data {
        if let syn::Fields::Named(fields) = &s.fields {
            fields.named.clone()
        } else {
            panic!("Only named fields are supported.");
        }
    } else {
        panic!("Only structs are supported.");
    };

    // Generate the new struct name with "Partial" prefix
    let partial_name = Ident::new(&format!("Partial{}", name), Span::call_site());

    let optional_fields = fields.iter().map(|field| {
        let field_name = field.ident.as_ref().unwrap();
        let field_type = &field.ty;
        quote! {
            #field_name: core::option::Option<#field_type>
        }
    });
    let field_names = fields.iter().map(|field| field.ident.as_ref().unwrap());
    let field_names_clone = field_names.clone();

    // Generate the new struct
    let gen = quote! {
        #[skip_serializing_none]
        #[derive(Serialize, Deserialize, Debug, Clone, Default)]
        #[serde(rename_all = "camelCase")]
        pub struct #partial_name {
            #(pub #optional_fields),*
        }

        impl #name {
            fn from(user_settings: #partial_name, default_settings: #name) -> Self {
                Self {
                    #(
                        #field_names: user_settings.#field_names.unwrap_or(default_settings.#field_names)
                    ),*
                }
            }
        }

        impl UpdatableSettings for #partial_name {
            fn update(
                &self,
                updated_settings: core::option::Option<#partial_name>,
            ) -> Self {
                if !updated_settings.is_some() {
                    return self.clone();
                }

                let updated_settings = updated_settings.unwrap();

                Self {
                    #(
                        #field_names_clone: updated_settings.#field_names_clone.or(self.#field_names_clone.clone())
                    ),*
                }
            }
        }
    };

    let stream = gen.into();
    // Return the generated Rust code as a token stream
    stream
}

#[proc_macro_attribute]
pub fn settings(_attr: TokenStream, input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);

    let expanded = quote! {
        #[derive(Serialize, Deserialize, Debug, Clone, PartialEq, Partial)]
        #[serde(rename_all = "camelCase")]
        #input
    };

    expanded.into()
}
