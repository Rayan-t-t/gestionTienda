create or replace function public.finalizar_compra(p_articulos jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  articulo record;
  filas_actualizadas integer;
begin
  if auth.uid() is null then
    raise exception 'Debes iniciar sesión para finalizar el pedido.'
      using errcode = '42501';
  end if;

  if p_articulos is null or pg_catalog.jsonb_typeof(p_articulos) <> 'array' then
    raise exception 'El carrito está vacío o no tiene un formato válido.'
      using errcode = '22023';
  end if;

  if pg_catalog.jsonb_array_length(p_articulos) = 0 then
    raise exception 'El carrito está vacío o no tiene un formato válido.'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(p_articulos) as elemento(valor)
    where pg_catalog.jsonb_typeof(elemento.valor) <> 'object'
      or coalesce(elemento.valor ->> 'id', '') !~ '^[1-9][0-9]*$'
      or coalesce(elemento.valor ->> 'cantidad', '') !~ '^[1-9][0-9]*$'
  ) then
    raise exception 'El carrito contiene identificadores o cantidades no válidos.'
      using errcode = '22023';
  end if;

  if exists (
    select elemento.valor ->> 'id'
    from pg_catalog.jsonb_array_elements(p_articulos) as elemento(valor)
    group by elemento.valor ->> 'id'
    having pg_catalog.count(*) > 1
  ) then
    raise exception 'El carrito contiene productos duplicados.'
      using errcode = '22023';
  end if;

  for articulo in
    select
      (elemento.valor ->> 'id')::bigint as id,
      (elemento.valor ->> 'cantidad')::integer as cantidad
    from pg_catalog.jsonb_array_elements(p_articulos) as elemento(valor)
    order by (elemento.valor ->> 'id')::bigint
  loop
    update public."video-juegos" as juego
    set stock = juego.stock - articulo.cantidad
    where juego.id = articulo.id
      and juego.disponible is true
      and juego.stock >= articulo.cantidad;

    get diagnostics filas_actualizadas = row_count;
    if filas_actualizadas <> 1 then
      raise exception 'Producto no disponible o stock insuficiente para el videojuego %.',
        articulo.id
        using errcode = 'P0001';
    end if;
  end loop;

  return true;
end;
$$;

revoke all on function public.finalizar_compra(jsonb) from public, anon;
grant execute on function public.finalizar_compra(jsonb) to authenticated;

notify pgrst, 'reload schema';