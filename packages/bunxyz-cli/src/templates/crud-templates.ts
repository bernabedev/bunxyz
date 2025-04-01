// Template for index.ts (List and Create)
export const listTemplate = (
  resourceName: string,
  capitalizedResourceName: string
) => `
import { BunxyzRequest, BunxyzResponse, RequestValidationError } from 'bunxyz';
import { z } from 'zod';

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

    console.log('Fetching ${resourceName} list with limit:', limit, 'offset:', offset);

    // TODO: Implement database query to fetch ${resourceName}s
    const ${resourceName}s = [
      { id: 1, name: 'Example ${capitalizedResourceName} 1' },
      { id: 2, name: 'Example ${capitalizedResourceName} 2' },
    ];
    const total${capitalizedResourceName}s = ${resourceName}s.length;

    return BunxyzResponse.json({
      data: ${resourceName}s,
      meta: {
        limit,
        offset,
        total: total${capitalizedResourceName}s,
      },
    });
  } catch (error: any) {
    console.error('Error fetching ${resourceName} list:', error);
    return BunxyzResponse.json({ error: 'Failed to fetch ${resourceName}s' }, { status: 500 });
  }
}

export async function POST(req: BunxyzRequest) {
  try {
    const validatedBody = await req.json(create${capitalizedResourceName}Schema);

    console.log('Creating new ${resourceName} with data:', validatedBody);

    // TODO: Implement database save logic
    const new${capitalizedResourceName} = {
      id: Math.floor(Math.random() * 1000) + 1,
      ...validatedBody,
    };

    return BunxyzResponse.json(new${capitalizedResourceName}, { status: 201 });

  } catch (error: any) {
    if (error instanceof RequestValidationError) {
        console.warn('Validation error during ${resourceName} creation:', error.flatten());
        return BunxyzResponse.validationError(new z.ZodError(error.issues));
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

// Template for [id].ts (Read, Update, Delete by ID)
export const idTemplate = (
  resourceName: string,
  capitalizedResourceName: string
) => `
import { BunxyzRequest, BunxyzResponse, RequestValidationError } from 'bunxyz';
import { z } from 'zod';

export const ${resourceName}IdParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: "${capitalizedResourceName} ID must be a positive integer" }),
});

import { create${capitalizedResourceName}Schema } from './index.js';
export const update${capitalizedResourceName}Schema = create${capitalizedResourceName}Schema.partial();

export async function GET(req: BunxyzRequest) {
  try {
    const { id } = req.validatedData?.params as z.infer<typeof ${resourceName}IdParamSchema>;

    console.log('Fetching ${resourceName} with ID:', id);

    // TODO: Implement database query to fetch ${resourceName} by ID
    const ${resourceName} = { id, name: 'Example ${capitalizedResourceName}' };

    if (!${resourceName}) {
      return BunxyzResponse.json({ error: '${capitalizedResourceName} not found' }, { status: 404 });
    }

    return BunxyzResponse.json(${resourceName});

  } catch (error: any) {
     if (error instanceof RequestValidationError) {
       return BunxyzResponse.validationError(new z.ZodError(error.issues));
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

    console.log(\`Updating ${resourceName} \${id} with data:\`, validatedBody);

    // TODO: Implement database update logic
    const updated${capitalizedResourceName} = { id, ...validatedBody };

    if (!updated${capitalizedResourceName}) {
       return BunxyzResponse.json({ error: '${capitalizedResourceName} not found' }, { status: 404 });
    }

    return BunxyzResponse.json(updated${capitalizedResourceName});

  } catch (error: any) {
     if (error instanceof RequestValidationError) {
       return BunxyzResponse.validationError(new z.ZodError(error.issues));
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

    console.log('Deleting ${resourceName} with ID:', id);

    // TODO: Implement database delete logic
    const deleted = true;

    if (!deleted) {
       return BunxyzResponse.json({ error: '${capitalizedResourceName} not found' }, { status: 404 });
    }

    return BunxyzResponse.json({ message: '${capitalizedResourceName} deleted successfully' });

  } catch (error: any) {
     if (error instanceof RequestValidationError) {
       return BunxyzResponse.validationError(new z.ZodError(error.issues));
     }
    console.error('Error deleting ${resourceName}:', error);
    return BunxyzResponse.json({ error: 'Failed to delete ${resourceName}' }, { status: 500 });
  }
}

export const paramsSchema = ${resourceName}IdParamSchema;
`;
