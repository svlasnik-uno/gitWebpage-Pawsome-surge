import { supabase } from "../supabase";

const TABLE_NAME = "tblItems";
const IMAGE_BUCKET = "Images";
const EVENT_TABLE_NAME = "tblEvents";
const ITEMTYPES_TABLE_NAME = "tblItemTypes";
const ITEMSUBTYPES_TABLE_NAME = "tblSubTypes";
const ITEMSTATUS_TABLE_NAME = "tblItemStatus";
const CUSTOMER_ORDER_TABLE_NAME = "CustOrders";
const CUSTOMER_ORDER_DETAIL_TABLE_NAME = "CustOrderDetail";
const URL = "https://pawsome-arts-and-crafts.com"; // "http://localhost:8080";

const ORDER_SELECT = `
  orderNum,
  created_at,
  orderTotal,
  orderEmail,
  orderStreetAddress,
  orderCity,
  orderPhone,
  custFirstName,
  custLastName,
  orderTotalItems,
  orderStatus,
  user_id,
  details:${CUSTOMER_ORDER_DETAIL_TABLE_NAME} (
    id,
    created_at,
    orderNum,
    itemNumber,
    tblItems:${TABLE_NAME} (
      ItemNumber,
      ItemDescription,
      ItemImage,
      ItemAskingPrice,
      ItemStatus
    )
  )
`;

const APIService = {
  async signUp(email, password, profileData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          usertype: profileData.userType,
          userfirstname: profileData.firstName,
          userlastname: profileData.lastName,
          userphone: profileData.phone || null,
        },
        emailRedirectTo: `${URL}/auth/callback`,
      },
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

  async resetPassword(email) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${URL}/reset-password`,
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
      .eq("ImageType", imageType)
      .order("ItemNumber", { ascending: false });

    if (error) throw error;
    return data;
  },
  async getItemsByStatus(status) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("ItemStatus", status)
      .order("ItemNumber", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getItemById(itemNumber) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .eq("ItemNumber", Number(itemNumber))
      .single();

    if (error) throw error;
    return data;
  },

  async getItemsByIds(itemNumbers = []) {
    const safeItemNumbers = itemNumbers
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n));

    if (!safeItemNumbers.length) return [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("*")
      .in("ItemNumber", safeItemNumbers)
      .order("ItemNumber", { ascending: true });

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

  async updateItemInventoryStatus(itemNumber, newStatus) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ItemStatus: newStatus })
      .eq("ItemNumber", Number(itemNumber))
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateItemStatuses(itemNumbers = [], newStatus) {
    const safeItemNumbers = itemNumbers
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n));

    if (!safeItemNumbers.length) return [];

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ItemStatus: newStatus })
      .in("ItemNumber", safeItemNumbers)
      .select();

    if (error) throw error;
    return data || [];
  },

  async deleteItem(itemNumber) {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq("ItemNumber", Number(itemNumber))
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

  getImageThumbnailUrl(item) {
    if (!item || !item.ItemImage) return "";

    const fullFileName = `thumbs/${item.ItemNumber}_${item.ItemImage}`;
    const { data } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(fullFileName);

    return data.publicUrl;
  },

  async uploadItemImage(file, thumbFileName, itemNumber) {
    if (!file) return "";

    const cleanFileName = file.name.replace(/\s+/g, "_");
    const fullFileName = `${itemNumber}_${cleanFileName}`;
    const cleanThumbFileName = thumbFileName.name.replace(/\s+/g, "_");
    const fullThumbFileName = `thumbs/${itemNumber}_${cleanThumbFileName}`;

    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(fullFileName, file, {
        upsert: true,
        cacheControl: "31536000",
      });

    if (error) throw error;

    const { error: error2 } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(fullThumbFileName, thumbFileName, {
        upsert: true,
        cacheControl: "31536000",
      });

    if (error2) throw error2;
    return cleanFileName;
  },

  async deleteItemImage(itemNumber, imageName) {
    if (!itemNumber || !imageName) return;

    const fullFileName = `${itemNumber}_${imageName}`;
    const thumbFileName = `thumbs/${itemNumber}_${imageName}`;

    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .remove([fullFileName, thumbFileName]);

    if (error) throw error;
  },

  getGalleryImageUrl(item) {
    if (!item || !item.ItemImage) return "";

    const fullFileName = `${item.ItemNumber}_${item.ItemImage}`;
    const { data } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(fullFileName);

    return data.publicUrl;
  },

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
      .gte("eventDate", startDate)
      .lte("eventDate", endDate)
      .order("eventDate", { ascending: true });

    if (error) throw error;
    return data;
  },

  async getEventById(eventId) {
    const { data, error } = await supabase
      .from(EVENT_TABLE_NAME)
      .select("*")
      .eq("id", Number(eventId))
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
      .order("eventDate", { ascending: true });

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
      .eq("id", Number(eventId))
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

  getEventImageThumbnailUrl(event) {
    if (!event || !event.eventImage) return "";

    const fullFileName = `Events/thumbs/${event.id}_${event.eventImage}`;
    const { data } = supabase.storage
      .from(IMAGE_BUCKET)
      .getPublicUrl(fullFileName);

    return data.publicUrl;
  },

  async uploadEventImage(file, thumbFile, eventId) {
    if (!file) return "";

    const cleanFileName = file.name.replace(/\s+/g, "_");
    const fullFileName = `Events/${eventId}_${cleanFileName}`;
    const cleanThumbFileName = thumbFile.name.replace(/\s+/g, "_");
    const fullThumbFileName = `Events/thumbs/${eventId}_${cleanThumbFileName}`;

    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(fullFileName, file, {
        upsert: true,
        cacheControl: "31536000",
      });

    if (error) throw error;

    const { error: error2 } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(fullThumbFileName, thumbFile, {
        upsert: true,
        cacheControl: "31536000",
      });

    if (error2) throw error2;
    return cleanFileName;
  },

  async deleteEventImage(eventId, imageName) {
    if (!eventId || !imageName) return;

    const fullFileName = `Events/${eventId}_${imageName}`;
    const thumbFileName = `Events/thumbs/${eventId}_${imageName}`;

    const { error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .remove([fullFileName, thumbFileName]);

    if (error) throw error;
  },

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
    const { id, ...updatePayload } = itemType;

    const { data, error } = await supabase
      .from(ITEMTYPES_TABLE_NAME)
      .update(updatePayload)
      .eq("itemType", itemType)
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

  async listItemImages(itemNumber) {
    const { data, error } = await supabase.storage
      .from(IMAGE_BUCKET)
      .list("items", {
        search: `${itemNumber}_`,
      });

    if (error) throw error;
    return data;
  },

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
      .eq("itemSubType", itemSubType)
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
      .eq("statusOption", itemStatus)
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

  async createCustomerOrder(order) {
    const orderPayload = {
      user_id: order.user_id || null,
      orderTotal: Number(order.orderTotal || 0),
      orderEmail: order.orderEmail,
      orderStreetAddress: order.orderStreetAddress,
      orderCity: order.orderCity,
      orderPhone: order.orderPhone,
      custFirstName: order.custFirstName,
      custLastName: order.custLastName,
      orderTotalItems: Number(order.orderTotalItems || 0),
      orderStatus: order.orderStatus || "P",
    };

    const { data, error } = await supabase
      .from(CUSTOMER_ORDER_TABLE_NAME)
      .insert([orderPayload])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createCustomerOrderDetails(orderNum, items) {
    if (!orderNum) {
      throw new Error("orderNum is required.");
    }

    if (!Array.isArray(items) || !items.length) {
      throw new Error("At least one cart item is required.");
    }

    const detailRows = items.map((item) => ({
      orderNum: Number(orderNum),
      itemNumber: Number(item.ItemNumber),
    }));

    const { data, error } = await supabase
      .from(CUSTOMER_ORDER_DETAIL_TABLE_NAME)
      .insert(detailRows)
      .select();

    if (error) throw error;
    return data;
  },

  async getOrderDetails(orderNum) {
    const { data, error } = await supabase
      .from(CUSTOMER_ORDER_DETAIL_TABLE_NAME)
      .select(
        `
        id,
        created_at,
        orderNum,
        itemNumber,
        tblItems:${TABLE_NAME} (
          ItemNumber,
          ItemDescription,
          ItemImage,
          ItemAskingPrice,
          ItemStatus
        )
      `,
      )
      .eq("orderNum", Number(orderNum))
      .order("id", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addItemToOrder(orderNum, itemNumber) {
    const numericOrderNum = Number(orderNum);
    const numericItemNumber = Number(itemNumber);

    if (!numericOrderNum) throw new Error("orderNum is required.");
    if (!numericItemNumber) throw new Error("itemNumber is required.");

    const item = await this.getItemById(numericItemNumber);
    if (!item) throw new Error("Item not found.");

    const { data: existing, error: existingError } = await supabase
      .from(CUSTOMER_ORDER_DETAIL_TABLE_NAME)
      .select("id")
      .eq("orderNum", numericOrderNum)
      .eq("itemNumber", numericItemNumber)
      .maybeSingle();

    if (existingError) throw existingError;
    if (existing) {
      throw new Error("That item is already on this order.");
    }

    const { data, error } = await supabase
      .from(CUSTOMER_ORDER_DETAIL_TABLE_NAME)
      .insert([
        {
          orderNum: numericOrderNum,
          itemNumber: numericItemNumber,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeItemFromOrder(detailId) {
    const { data, error } = await supabase
      .from(CUSTOMER_ORDER_DETAIL_TABLE_NAME)
      .delete()
      .eq("id", Number(detailId))
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateOrderAddress(orderNum, updates) {
    const payload = {
      custFirstName: updates.custFirstName,
      custLastName: updates.custLastName,
      orderPhone: updates.orderPhone,
      orderCity: updates.orderCity,
      orderStreetAddress: updates.orderStreetAddress,
    };

    const { data, error } = await supabase
      .from(CUSTOMER_ORDER_TABLE_NAME)
      .update(payload)
      .eq("orderNum", Number(orderNum))
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateOrderTotals(orderNum, orderTotal, orderTotalItems) {
    const { data, error } = await supabase
      .from(CUSTOMER_ORDER_TABLE_NAME)
      .update({
        orderTotal: Number(orderTotal || 0),
        orderTotalItems: Number(orderTotalItems || 0),
      })
      .eq("orderNum", Number(orderNum))
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async syncOrderTotals(orderNum) {
    const details = await this.getOrderDetails(orderNum);

    if (!details.length) {
      return {
        shouldDeleteOrder: true,
        orderTotal: 0,
        orderTotalItems: 0,
        details: [],
      };
    }

    const orderTotal = details.reduce(
      (sum, detail) => sum + Number(detail?.tblItems?.ItemAskingPrice || 0),
      0,
    );

    const orderTotalItems = details.length;

    const order = await this.updateOrderTotals(
      orderNum,
      orderTotal,
      orderTotalItems,
    );

    return {
      shouldDeleteOrder: false,
      orderTotal,
      orderTotalItems,
      order,
      details,
    };
  },

  async updateItemsStatusToPending(items) {
    if (!Array.isArray(items) || !items.length) return [];
    const itemNumbers = items.map((item) => Number(item.ItemNumber));
    return this.updateItemStatuses(itemNumbers, "P");
  },

  async createCompleteCustomerOrder(order, items) {
    const safeItems = Array.isArray(items) ? [...items] : [];

    const createdOrder = await this.createCustomerOrder(order);
    await this.createCustomerOrderDetails(createdOrder.orderNum, safeItems);
    await this.updateItemsStatusToPending(safeItems);

    await this.sendOrderConfirmationEmail({
      customerEmail: order.orderEmail,
      orderNum: createdOrder.orderNum,
      orderDate: createdOrder.created_at || new Date().toISOString(),
      orderTotalItems: Number(order.orderTotalItems || safeItems.length),
      items: safeItems,
    });

    return createdOrder;
  },

  async getMyOrders(userId) {
    if (!userId) {
      throw new Error("userId is required.");
    }

    const { data, error } = await supabase
      .from(CUSTOMER_ORDER_TABLE_NAME)
      .select(ORDER_SELECT)
      .eq("user_id", userId)
      .order("orderNum", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAllOrders() {
    const { data, error } = await supabase
      .from(CUSTOMER_ORDER_TABLE_NAME)
      .select(ORDER_SELECT)
      .order("user_id", { ascending: true })
      .order("orderNum", { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateCustomerOrder(orderNum, updates) {
    const { data, error } = await supabase
      .from(CUSTOMER_ORDER_TABLE_NAME)
      .update(updates)
      .eq("orderNum", Number(orderNum))
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCustomerOrder(orderNum) {
    const numericOrderNum = Number(orderNum);
    const details = await this.getOrderDetails(numericOrderNum);

    const itemNumbers = details
      .map((detail) => Number(detail.itemNumber))
      .filter((n) => Number.isFinite(n));

    if (itemNumbers.length) {
      await this.updateItemStatuses(itemNumbers, "AW");
    }

    const { data, error } = await supabase
      .from(CUSTOMER_ORDER_TABLE_NAME)
      .delete()
      .eq("orderNum", numericOrderNum)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeItemAndSyncOrder(orderNum, detail) {
    if (!detail?.id) {
      throw new Error("Order detail id is required.");
    }

    if (detail?.itemNumber) {
      await this.updateItemInventoryStatus(detail.itemNumber, "AW");
    }

    await this.removeItemFromOrder(detail.id);

    const syncResult = await this.syncOrderTotals(orderNum);

    if (syncResult.shouldDeleteOrder) {
      await this.deleteCustomerOrder(orderNum);
      return {
        deletedOrder: true,
      };
    }

    return {
      deletedOrder: false,
      details: syncResult.details,
      orderTotal: syncResult.orderTotal,
      orderTotalItems: syncResult.orderTotalItems,
    };
  },

  async addItemAndSyncOrder(orderNum, itemNumber) {
    await this.addItemToOrder(orderNum, itemNumber);

    const syncResult = await this.syncOrderTotals(orderNum);

    return {
      details: syncResult.details,
      orderTotal: syncResult.orderTotal,
      orderTotalItems: syncResult.orderTotalItems,
    };
  },

  async sendEmail({ to, subject, text, html, from }) {
    const response = await fetch(
      "https://xpbcouwccxlaybkbtuqh.supabase.co/functions/v1/resend-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ to, subject, text, html, from }),
      },
    );

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { error: rawText };
    }

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    return data;
  },

  async sendOrderConfirmationEmail({
    customerEmail,
    orderNum,
    orderDate,
    orderTotalItems,
    items,
  }) {
    if (!customerEmail) {
      throw new Error("customerEmail is required.");
    }

    const safeItems = Array.isArray(items) ? items : [];

    const recipients = [customerEmail, "pawsomeartsandcrafts@yahoo.com"];

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(orderDate));

    const itemLinesText = safeItems.length
      ? safeItems
          .map(
            (item, index) =>
              `${index + 1}. ${item.ItemDescription || "No description provided"}`,
          )
          .join("\n")
      : "No items listed.";

    const itemLinesHtml = safeItems.length
      ? safeItems
          .map(
            (item) =>
              `<li>${this.escapeHtml(
                item.ItemDescription || "No description provided",
              )}</li>`,
          )
          .join("")
      : "<li>No items listed.</li>";

    const subject = `Order Confirmation #${orderNum}`;

    const text = `Thank you for your order.

Order Number: ${orderNum}
Order Date: ${formattedDate}
Number of Items: ${orderTotalItems}

Items Ordered:
${itemLinesText}

Reminder: Only local delivery is available.

You will be contacted for payment and to arrange delivery.

Pawsome Arts and Crafts`;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Order Confirmation</h2>
        <p>Thank you for your order.</p>
        <p><strong>Order Number:</strong> ${this.escapeHtml(orderNum)}</p>
        <p><strong>Order Date:</strong> ${this.escapeHtml(formattedDate)}</p>
        <p><strong>Number of Items:</strong> ${this.escapeHtml(orderTotalItems)}</p>
        <p><strong>Items Ordered:</strong></p>
        <ul>${itemLinesHtml}</ul>
        <p><strong>Reminder:</strong> Only local delivery is available.</p>
        <p>You will be contacted for payment and to arrange delivery.</p>
        <p>Pawsome Arts and Crafts</p>
      </div>
    `;

    return this.sendEmail({
      to: recipients,
      subject,
      text,
      html,
    });
  },

  async sendContactUsEmail({
    firstName,
    lastName,
    email,
    inquiryTypes,
    message,
  }) {
    if (!firstName || !lastName || !email || !message) {
      throw new Error("All contact form fields are required.");
    }

    if (!Array.isArray(inquiryTypes) || !inquiryTypes.length) {
      throw new Error("At least one inquiry type is required.");
    }

    const sentAtIso = new Date().toISOString();

    const formattedTimestamp = new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(sentAtIso));

    const safeFirstName = this.escapeHtml(firstName);
    const safeLastName = this.escapeHtml(lastName);
    const safeEmail = this.escapeHtml(email);
    const safeMessage = this.escapeHtml(message).replace(/\n/g, "<br />");
    const inquiryTypeText = inquiryTypes.join(", ");
    const safeInquiryTypeText = this.escapeHtml(inquiryTypeText);

    const businessEmail = "pawsomeartsandcrafts@yahoo.com";

    const customerSubject =
      "We received your message - Pawsome Arts And Crafts";
    const businessSubject = `Contact Us Submission - ${firstName} ${lastName}`;

    const customerText = `Hello ${firstName} ${lastName},

Thank you for contacting Pawsome Arts And Crafts. We received your message and will review it as soon as possible.

Submitted On: ${formattedTimestamp}
Email Address: ${email}
Inquiry Type(s): ${inquiryTypeText}

Message:
${message}

Pawsome Arts And Crafts`;

    const customerHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>Thank you for contacting Pawsome Arts And Crafts</h2>
        <p>Hello ${safeFirstName} ${safeLastName},</p>
        <p>We received your message and will review it as soon as possible.</p>
        <p><strong>Submitted On:</strong> ${this.escapeHtml(formattedTimestamp)}</p>
        <p><strong>Email Address:</strong> ${safeEmail}</p>
        <p><strong>Inquiry Type(s):</strong> ${safeInquiryTypeText}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
        <p>Pawsome Arts And Crafts</p>
      </div>
    `;

    const businessText = `New Contact Us submission received.

Submitted On: ${formattedTimestamp}
First Name: ${firstName}
Last Name: ${lastName}
Email Address: ${email}
Inquiry Type(s): ${inquiryTypes.join(", ")}

Message:
${message}`;

    const businessHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>New Contact Us Submission</h2>
        <p><strong>Submitted On:</strong> ${this.escapeHtml(formattedTimestamp)}</p>
        <p><strong>First Name:</strong> ${safeFirstName}</p>
        <p><strong>Last Name:</strong> ${safeLastName}</p>
        <p><strong>Email Address:</strong> ${safeEmail}</p>
        <p><strong>Inquiry Type(s):</strong> ${safeInquiryTypeText}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      </div>
    `;

    await this.sendEmail({
      to: [email],
      subject: customerSubject,
      text: customerText,
      html: customerHtml,
    });

    await this.sendEmail({
      to: [businessEmail],
      subject: businessSubject,
      text: businessText,
      html: businessHtml,
    });

    return {
      success: true,
      sentAt: sentAtIso,
    };
  },

  escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },
};

export default APIService;
