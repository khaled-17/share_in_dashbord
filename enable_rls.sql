-- Function to enable RLS and add policy safely
create or replace function enable_public_access(tbl_name text) returns void as $$
begin
    if exists (select from pg_tables where schemaname = 'public' and tablename = tbl_name) then
        execute format('alter table %I enable row level security', tbl_name);
        
        -- Drop existing policy if exists
        begin
            execute format('drop policy "Public Access" on %I', tbl_name);
        exception when undefined_object then
            null;
        end;

        -- Create permissive policy
        execute format('create policy "Public Access" on %I for all using (true) with check (true)', tbl_name);
        
        -- Grant permissions
        execute format('grant all on %I to anon, authenticated, service_role', tbl_name);
        
        raise notice 'Enabled public access for %', tbl_name;
    else
        -- Try capitalized version if lower case not found (Prisma default behavior)
        if exists (select from pg_tables where schemaname = 'public' and tablename = initcap(tbl_name)) then
             -- Recursive call or just handle here. Let's just handle here to be safe
             execute format('alter table %I enable row level security', initcap(tbl_name));
             begin
                execute format('drop policy "Public Access" on %I', initcap(tbl_name));
             exception when undefined_object then null;
             end;
             execute format('create policy "Public Access" on %I for all using (true) with check (true)', initcap(tbl_name));
             execute format('grant all on %I to anon, authenticated, service_role', initcap(tbl_name));
             raise notice 'Enabled public access for %', initcap(tbl_name);
        else
             raise notice 'Table % not found, skipping', tbl_name;
        end if;
    end if;
end;
$$ language plpgsql;

-- Grant schema usage
grant usage on schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;

-- Apply to tables (using the mapped names mostly, function handles missing ones gracefully)
select enable_public_access('customers');
select enable_public_access('suppliers');
select enable_public_access('revenue');
select enable_public_access('revenue_types');
select enable_public_access('expenses');
select enable_public_access('expense_types');
select enable_public_access('shareen');
select enable_public_access('project_types');
select enable_public_access('quotations');
select enable_public_access('quotation_items');
select enable_public_access('work_orders');
select enable_public_access('WorkOrder'); -- Explicitly try PascalCase
select enable_public_access('partners');
select enable_public_access('receipt_vouchers');
select enable_public_access('payment_vouchers');
select enable_public_access('check_details');
select enable_public_access('employees');
select enable_public_access('company_settings');
select enable_public_access('CustomerReview');
