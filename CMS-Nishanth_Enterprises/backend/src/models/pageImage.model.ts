export interface PageImageRow {
  id: string;
  image_url: string;
  section_id: string;
  /** true = active, false = inactive */
  status: boolean;
  created_time: Date;
  updated_time: Date;
}

export function mapPageImageRow(row: Record<string, unknown>): PageImageRow {
  const st = row.status;
  const status =
    st === false || st === "false" || st === "f" || st === 0 ? false : true;
  return {
    id: String(row.id),
    image_url: String(row.image_url),
    section_id: String(row.section_id),
    status,
    created_time: row.created_time as Date,
    updated_time: row.updated_time as Date
  };
}
