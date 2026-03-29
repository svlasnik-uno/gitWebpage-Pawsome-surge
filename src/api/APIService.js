import { supabase } from "../supabase";

const TABLE_NAME = "tblItems";
const IMAGE_BUCKET = "Images";

const APIService = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async getItems() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("ItemNumber", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getItemById(itemNumber) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("ItemNumber", itemNumber)
      .single();

    if (error) throw error;
    return data;
  },

  async createItem(item) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItem(itemNumber, item) {
    const { ItemNumber, ...updatePayload } = item;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(updatePayload)
      .eq("ItemNumber", Number(itemNumber))
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteItem(itemNumber) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("ItemNumber", itemNumber)
      .select();

    if (error) throw error;
    return data;
  },

  getImageUrl(item) {
    if (!item || !item.ItemImage) return "";

    const fullFileName = `${item.ItemNumber}_${item.ItemImage}`;

    const { data } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(fullFileName);

    return data.publicUrl;
  },

  async uploadItemImage(file, itemNumber) {
    if (!file) return "";

    const cleanFileName = file.name.replace(/\s+/g, "_");
    const fullFileName = `${itemNumber}_${cleanFileName}`;

    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(fullFileName, file, { upsert: true });

    if (error) throw error;

    return cleanFileName;
  },

  async deleteItemImage(itemNumber, imageName) {
    if (!itemNumber || !imageName) return;

    const fullFileName = `${itemNumber}_${imageName}`;

    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .remove([fullFileName]);

    if (error) throw error;
  },
};

export default APIService;