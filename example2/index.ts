import { GraphQLFileLoader } from '@graphql-tools/graphql-file-loader'
import { loadSchema } from '@graphql-tools/load'

import { createServerAdapter } from '@whatwg-node/server';
import { Router } from 'itty-router';

import { useSofa, OpenAPI } from 'sofa-api';
import { writeFileSync } from 'fs';

async function main() {
    // schema is `GraphQLSchema` instance
    const schema = await loadSchema('schema.graphql', {
        // load from a single schema file
        loaders: [new GraphQLFileLoader()]
    })

    const openApi = OpenAPI({
        schema,
        info: {
            title: 'Example API',
            version: '3.0.0',
        },
    });

    const app = createServerAdapter(Router());

    app.use(
        '/api',
        useSofa({
            basePath: '/api',
            schema,
            onRoute(info) {
                openApi.addRoute(info, {
                    basePath: '/api',
                });
            },
        })
    );

    // writes every recorder route
    writeFileSync('./swagger.json', JSON.stringify(openApi.get(), null, 2));
}

main().catch(error => console.error(error))
