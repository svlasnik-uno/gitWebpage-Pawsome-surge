import { supabase } from "../supabase";

const TABLE_NAME = "tblItems";
const IMAGE_BUCKET = "Images";
const EVENT_TABLE_NAME = "tblEvents";
const ITEMTYPES_TABLE_NAME = "tblItemTypes";
const ITEMSUBTYPES_TABLE_NAME = "tblSubTypes";
const ITEMSTATUS_TABLE_NAME = "tblItemStatus";

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

  async getItemsSortCriteria(sortCriteria = [], filterCriteria = []) {
    let query = supabase.from(TABLE_NAME).select("*");

    if (Array.isArray(filterCriteria)) {
      filterCriteria.forEach((filter) => {
        if (!filter || !filter.column || filter.value == null) return;

        if (filter.operator === "eq") {
          query = query.eq(filter.column, filter.value);
        }

        if (
          filter.operator === "in" &&
          Array.isArray(filter.value) &&
          filter.value.length
        ) {
          query = query.in(filter.column, filter.value);
        }
      });
    }

    if (Array.isArray(sortCriteria) && sortCriteria.length) {
      sortCriteria.forEach((sort) => {
        if (!sort || !sort.column) return;

        query = query.order(sort.column, {
          ascending: sort.ascending !== false,
        });
      });
    } else {
      query = query.order("ItemNumber", { ascending: true });
    }
    const { data, error } = await query;

    if (error) throw error;
    return data;
  },
  async getItems() {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .order("ItemNumber", { ascending: true });

    if (error) throw error;
    return data;
  },
  async getItemsByImageType(imageType) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("ImageType", imageType) // 'G' for gallery, 'E' for event, 'H' for home
      .order("ItemNumber", { ascending: false });
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
  // Event-related API methods
  async getEvents() {
    const { data, error } = await supabase
      .from(EVENT_TABLE_NAME)
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data;
  },
  async getEventsByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from(EVENT_TABLE_NAME)
      .select("*")
      .gte("eventDate", startDate) // start
      .lte("eventDate", endDate) // end
      .order("eventDate", { ascending: true });

    if (error) throw error;
    return data;
  },
  async getEventById(eventId) {
    const { data, error } = await supabase
      .from(EVENT_TABLE_NAME)
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) throw error;
    return data;
  },
  async getEventsByYearAndSeason(year, season) {
    const { data, error } = await supabase
      .from(EVENT_TABLE_NAME)
      .select("*")
      .eq("eventSeason", season)
      .eq("eventYear", year)
      .order("eventDate", { ascending: true });

    if (error) throw error;
    return data;
  },
  async getEventsByDisplay(eventDisplay = "Y") {
    const { data, error } = await supabase
      .from(EVENT_TABLE_NAME)
      .select("*")
      .eq("eventDisplay", eventDisplay)
      .order("id", { ascending: true });

    if (error) throw error;
    return data;
  },
  async createEvent(event) {
    const { data, error } = await supabase
      .from(EVENT_TABLE_NAME)
      .insert([event])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateEvent(eventId, event) {
    const { id, ...updatePayload } = event;

    const { data, error } = await supabase
      .from(EVENT_TABLE_NAME)
      .update(updatePayload)
      .eq("id", Number(eventId))
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteEvent(eventId) {
    const { data, error } = await supabase
      .from(EVENT_TABLE_NAME)
      .delete()
      .eq("id", eventId)
      .select();

    if (error) throw error;
    return data;
  },

  getEventImageUrl(event) {
    if (!event || !event.eventImage) return "";

    const fullFileName = `Events/${event.id}_${event.eventImage}`;

    const { data } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(fullFileName);

    return data.publicUrl;
  },
  async uploadEventImage(file, eventId) {
    if (!file) return "";

    const cleanFileName = file.name.replace(/\s+/g, "_");
    const fullFileName = `Events/${eventId}_${cleanFileName}`;

    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(fullFileName, file, { upsert: true });

    if (error) throw error;

    return cleanFileName;
  },

  async deleteEventImage(eventId, imageName) {
    if (!eventId || !imageName) return;

    const fullFileName = `Events/${eventId}_${imageName}`;

    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .remove([fullFileName]);

    if (error) throw error;
  },
  // Item Type -related API methods
  async getItemTypes() {
    const { data, error } = await supabase
      .from(ITEMTYPES_TABLE_NAME)
      .select("*")
      .order("catType", { ascending: true });

    if (error) throw error;
    return data;
  },
 
  async createItemType(itemType) {
    const { data, error } = await supabase
      .from(ITEMTYPES_TABLE_NAME)
      .insert([itemType])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItemType(itemType) {
    const { id, ...updatePayload } = item;

    const { data, error } = await supabase
      .from(ITEMTYPES_TABLE_NAME)
      .update(updatePayload)
      .eq("itemType", Text(itemType))
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteItemType(itemType) {
    const { data, error } = await supabase
      .from(ITEMTYPES_TABLE_NAME)
      .delete()
      .eq("itemType", itemType)
      .select();

    if (error) throw error;
    return data;
  },
    // Item SubType -related API methods
  async getItemSubTypes() {
    const { data, error } = await supabase
      .from(ITEMSUBTYPES_TABLE_NAME)
      .select("*")
      .order("subTypeName", { ascending: true });

    if (error) throw error;
    return data;
  },
 
  async createItemSubType(event) {
    const { data, error } = await supabase
      .from(ITEMSUBTYPES_TABLE_NAME)
      .insert([event])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItemSubType(itemSubType) {
    const { id, ...updatePayload } = itemSubType;

    const { data, error } = await supabase
      .from(ITEMSUBTYPES_TABLE_NAME)
      .update(updatePayload)
      .eq("itemSubType", Text(itemSubType))
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteItemSubType(itemSubType) {
    const { data, error } = await supabase
      .from(ITEMSUBTYPES_TABLE_NAME)
      .delete()
      .eq("itemSubType", itemSubType)
      .select();

    if (error) throw error;
    return data;
  },
   // Item Status -related API methods
  async getItemStatuses() {
    const { data, error } = await supabase
      .from(ITEMSTATUS_TABLE_NAME)
      .select("*")
      .order("statusOption", { ascending: true });

    if (error) throw error;
    return data;
  },
 
  async createItemStatus(itemStatus) {
    const { data, error } = await supabase
      .from(ITEMSTATUS_TABLE_NAME)
      .insert([itemStatus])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItemStatus(itemStatus) {
    const { id, ...updatePayload } = itemStatus;

    const { data, error } = await supabase
      .from(ITEMSTATUS_TABLE_NAME)
      .update(updatePayload)
      .eq("statusOption", Text(itemStatus))
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async deleteItemStatus(itemStatus) {
    const { data, error } = await supabase
      .from(ITEMSTATUS_TABLE_NAME)
      .delete()
      .eq("statusOption", itemStatus)
      .select();

    if (error) throw error;
    return data;
  },
};

export default APIService;
