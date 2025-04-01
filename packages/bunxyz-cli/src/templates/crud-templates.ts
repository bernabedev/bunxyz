// --- DTO Templates ---

export const createDtoTemplate = (
  resourceName: string,
  capitalizedResourceName: string
) => `
import { z } from 'zod';

export const create${capitalizedResourceName}DtoSchema = z.object({
  // TODO: Define properties for creating a ${resourceName}
  name: z.string().min(3),
  email: z.string().email(),
});

export type Create${capitalizedResourceName}Dto = z.infer<typeof create${capitalizedResourceName}DtoSchema>;
`;

export const updateDtoTemplate = (
  resourceName: string,
  capitalizedResourceName: string
) => `
import { z } from 'zod';
import { create${capitalizedResourceName}DtoSchema } from './create-${resourceName}.dto';

export const update${capitalizedResourceName}DtoSchema = create${capitalizedResourceName}DtoSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
  });

export type Update${capitalizedResourceName}Dto = z.infer<typeof update${capitalizedResourceName}DtoSchema>;
`;

// --- Simple Route Templates ---

export const simpleListTemplate = (
  resourceName: string,
  capitalizedResourceName: string
) => `
import { BunxyzRequest, BunxyzResponse } from 'bunxyz';
import { z } from 'zod';
import { create${capitalizedResourceName}DtoSchema } from './dto/create-${resourceName}.dto';

export const querySchema = z.object({
    limit: z.coerce.number().int().positive().optional().default(10),
    offset: z.coerce.number().int().nonnegative().optional().default(0),
}).optional();

export async function GET(req: BunxyzRequest) {
  const validatedQuery = req.validatedData?.query ?? {};
  console.log('List ${resourceName} query:', validatedQuery);

  // TODO: Implement fetch logic
  const items: [] = [];
  const total = 0;

  return BunxyzResponse.json({ data: items, meta: { total, ...validatedQuery } });
}

export async function POST(req: BunxyzRequest) {
  try {
    const validatedBody = await req.json(create${capitalizedResourceName}DtoSchema);
    console.log('Create ${resourceName} body:', validatedBody);

    // TODO: Implement create logic
    const newItem = { id: 'newly_created_id', ...validatedBody };

    return BunxyzResponse.json(newItem, { status: 201 });
  } catch (error) {
     console.error("Error creating ${resourceName}:", error);
     if (error instanceof z.ZodError) {
         return BunxyzResponse.validationError(error);
     }
     return BunxyzResponse.json({ error: "Failed to create ${resourceName}" }, { status: 500 });
  }
}
`;

export const simpleIdTemplate = (
  resourceName: string,
  capitalizedResourceName: string
) => `
import { BunxyzRequest, BunxyzResponse } from 'bunxyz';
import { z } from 'zod';
import { update${capitalizedResourceName}DtoSchema } from './dto/update-${resourceName}.dto';

export const paramsSchema = z.object({
  id: z.coerce.number().int().positive({ message: "${capitalizedResourceName} ID must be a positive integer" }),
});

export async function GET(req: BunxyzRequest) {
  const { id } = req.validatedData?.params ?? {};
  console.log('Get ${resourceName} by ID:', id);

  // TODO: Implement fetch by ID logic
  const item = null;

  if (!item) {
    return BunxyzResponse.json({ error: "${capitalizedResourceName} not found" }, { status: 404 });
  }
  return BunxyzResponse.json(item);
}

export async function PUT(req: BunxyzRequest) {
  try {
    const { id } = req.validatedData?.params ?? {};
    const validatedBody = await req.json(update${capitalizedResourceName}DtoSchema);

    console.log('Update ${resourceName} ID:', id, 'with body:', validatedBody);

    // TODO: Implement update logic
    const updatedItem = { id, ...validatedBody };

    if (!updatedItem) {
       return BunxyzResponse.json({ error: "${capitalizedResourceName} not found" }, { status: 404 });
    }
    return BunxyzResponse.json(updatedItem);

  } catch (error) {
     console.error("Error updating ${resourceName}:", error);
      if (error instanceof z.ZodError) {
         return BunxyzResponse.validationError(error);
     }
     return BunxyzResponse.json({ error: "Failed to update ${resourceName}" }, { status: 500 });
  }
}

export async function DELETE(req: BunxyzRequest) {
    const { id } = req.validatedData?.params ?? {};
    console.log('Delete ${resourceName} by ID:', id);

    // TODO: Implement delete logic
    const deleted = false;

    if (!deleted) {
       return BunxyzResponse.json({ error: "${capitalizedResourceName} not found" }, { status: 404 });
    }

    return new Response(null, { status: 204 });
}
`;

// --- Demo Route Templates ---

export const listTemplateWithDemo = (
  resourceName: string,
  capitalizedResourceName: string
) => `
import { BunxyzRequest, BunxyzResponse, RequestValidationError } from 'bunxyz';
import { z, ZodError } from 'zod';

export const create${capitalizedResourceName}Schema = z.object({
  name: z.string().min(1, { message: "${capitalizedResourceName} name cannot be empty" }),
});

export const list${capitalizedResourceName}QuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(10),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

export async function GET(req: BunxyzRequest) {
  try {
    const queryValidation = list${capitalizedResourceName}QuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
      return BunxyzResponse.validationError(queryValidation.error);
    }
    const { limit, offset } = queryValidation.data;
    
    const ${resourceName}s = [ 
      { id: 1, name: 'Demo ${capitalizedResourceName} 1' }, 
      { id: 2, name: 'Demo ${capitalizedResourceName} 2' } 
    ];
    const total${capitalizedResourceName}s = ${resourceName}s.length;
    
    return BunxyzResponse.json({ 
      data: ${resourceName}s, 
      meta: { limit, offset, total: total${capitalizedResourceName}s } 
    });
  } catch (error: any) {
    console.error('Error fetching ${resourceName} list:', error);
    return BunxyzResponse.json({ error: 'Failed to fetch ${resourceName}s' }, { status: 500 });
  }
}

export async function POST(req: BunxyzRequest) {
  try {
    const validatedBody = await req.json(create${capitalizedResourceName}Schema);
    const new${capitalizedResourceName} = { 
      id: Math.floor(Math.random() * 1000) + 1, 
      ...validatedBody 
    };
    return BunxyzResponse.json(new${capitalizedResourceName}, { status: 201 });
  } catch (error: any) {
    if (error instanceof RequestValidationError) {
        return BunxyzResponse.validationError(new ZodError(error.issues));
    }
    if (error instanceof Error && error.message.includes('Invalid JSON')) {
        return BunxyzResponse.json({ error: error.message }, { status: 400 });
    }
    console.error('Error creating ${resourceName}:', error);
    return BunxyzResponse.json({ error: 'Failed to create ${resourceName}' }, { status: 500 });
  }
}

export const querySchema = list${capitalizedResourceName}QuerySchema;
`;

export const idTemplateWithDemo = (
  resourceName: string,
  capitalizedResourceName: string
) => `
import { BunxyzRequest, BunxyzResponse, RequestValidationError } from 'bunxyz';
import { z, ZodError } from 'zod';
import { create${capitalizedResourceName}Schema } from './index;

export const ${resourceName}IdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: "${capitalizedResourceName} ID must be a positive integer" }),
});

export const update${capitalizedResourceName}Schema = create${capitalizedResourceName}Schema.partial();

export async function GET(req: BunxyzRequest) {
  try {
    const { id } = req.validatedData?.params as z.infer<typeof ${resourceName}IdParamSchema>;
    const ${resourceName} = { id, name: 'Demo ${capitalizedResourceName}' };
    
    if (!${resourceName}) { 
      return BunxyzResponse.json({ error: '${capitalizedResourceName} not found' }, { status: 404 }); 
    }
    return BunxyzResponse.json(${resourceName});
  } catch (error: any) {
     if (error instanceof RequestValidationError) { 
       return BunxyzResponse.validationError(new ZodError(error.issues)); 
     }
    console.error('Error fetching ${resourceName} by ID:', error);
    return BunxyzResponse.json({ error: 'Failed to fetch ${resourceName}' }, { status: 500 });
  }
}

export async function PUT(req: BunxyzRequest) {
  try {
    const { id } = req.validatedData?.params as z.infer<typeof ${resourceName}IdParamSchema>;
    const validatedBody = await req.json(update${capitalizedResourceName}Schema);
    
    if (Object.keys(validatedBody).length === 0) { 
      return BunxyzResponse.json({ error: 'No fields provided for update' }, { status: 400 }); 
    }
    
    const updated${capitalizedResourceName} = { id, ...validatedBody };
    
    if (!updated${capitalizedResourceName}) { 
      return BunxyzResponse.json({ error: '${capitalizedResourceName} not found' }, { status: 404 }); 
    }
    return BunxyzResponse.json(updated${capitalizedResourceName});
  } catch (error: any) {
     if (error instanceof RequestValidationError) { 
       return BunxyzResponse.validationError(new ZodError(error.issues)); 
     }
    if (error instanceof Error && error.message.includes('Invalid JSON')) { 
      return BunxyzResponse.json({ error: error.message }, { status: 400 }); 
    }
    console.error('Error updating ${resourceName}:', error);
    return BunxyzResponse.json({ error: 'Failed to update ${resourceName}' }, { status: 500 });
  }
}

export async function DELETE(req: BunxyzRequest) {
  try {
    const { id } = req.validatedData?.params as z.infer<typeof ${resourceName}IdParamSchema>;
    const deleted = true;
    
    if (!deleted) { 
      return BunxyzResponse.json({ error: '${capitalizedResourceName} not found' }, { status: 404 }); 
    }
    return BunxyzResponse.json({ message: '${capitalizedResourceName} deleted successfully' });
  } catch (error: any) {
     if (error instanceof RequestValidationError) { 
       return BunxyzResponse.validationError(new ZodError(error.issues)); 
     }
    console.error('Error deleting ${resourceName}:', error);
    return BunxyzResponse.json({ error: 'Failed to delete ${resourceName}' }, { status: 500 });
  }
}

export const paramsSchema = ${resourceName}IdParamSchema;
`;
