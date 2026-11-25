import HawkCatcher from '@hawk.so/javascript';
import { defineBoot } from '#q-app'

export default defineBoot(({app}) => {
    new HawkCatcher({
        vue: app,
        disableGlobalErrorsHandling: true,
        token: 'eyJpbnRlZ3JhdGlvbklkIjoiZDc5NGQwZjktNTlhNi00ZDU2LWIzM2QtYjkyYjlkMmVmNmZhIiwic2VjcmV0IjoiMjgxYTJjYmQtYjI3Yi00NDIyLWIzMjAtOGNmMTA0ZjVmOGMyIn0='
    });
})
