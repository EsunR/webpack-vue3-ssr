import path from 'path';
import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';

const rootDir = path.resolve(__dirname, '../');

const config: webpack.Configuration = {
    mode: 'none',
    target: 'node',
    entry: './server/index.ts',
    output: {
        path: path.resolve(rootDir, 'dist'),
        clean: true,
        filename: 'server.js',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {transpileOnly: true},
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    externalsPresets: {node: true},
    externals: [nodeExternals()],
};

export default config;
