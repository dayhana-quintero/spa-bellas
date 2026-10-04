import { listSuppliesForAdmin, saveSupplyForAdmin } from '@/domain/inventory/inventory-service';
import { requireAdmin } from '../guard';

export async function GET() {
	try {
		await requireAdmin();
	} catch {
		return Response.json({ error: 'No autorizado.' }, { status: 401 });
	}
	try {
		return Response.json(await listSuppliesForAdmin());
	} catch (error) {
		return Response.json({ error: error instanceof Error ? error.message : 'No se pudo consultar el inventario.' }, { status: 400 });
	}
}

export async function POST(request: Request) {
	try {
		await requireAdmin();
	} catch {
		return Response.json({ error: 'No autorizado.' }, { status: 401 });
	}
	try {
		return Response.json(await saveSupplyForAdmin(await request.json()), { status: 201 });
	} catch (error) {
		return Response.json({ error: error instanceof Error ? error.message : 'No se pudo guardar el insumo.' }, { status: 400 });
	}
}

export async function PUT(request: Request) {
	try {
		await requireAdmin();
	} catch {
		return Response.json({ error: 'No autorizado.' }, { status: 401 });
	}
	try {
		return Response.json(await saveSupplyForAdmin(await request.json()));
	} catch (error) {
		return Response.json({ error: error instanceof Error ? error.message : 'No se pudo guardar el insumo.' }, { status: 400 });
	}
}
