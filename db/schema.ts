import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const enquiries = sqliteTable("enquiries", {
  id: text("id").primaryKey(), name: text("name").notNull(), contact: text("contact").notNull(),
  chaos: text("chaos").notNull(), format: text("format").notNull(),
  consent: integer("consent", { mode: "boolean" }).notNull(), createdAt: text("created_at").notNull(),
});
