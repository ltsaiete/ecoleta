import Knex from 'knex';

export async function seed(knex:Knex) {
    await knex('items').insert([
        {
            title: 'Lâmpadas',
            image: 'lamapadas.svg'
        },
        {
            title: 'Pilhas e baterias',
            image: 'baterias.svg'
        },
        {
            title: 'Papéis e papelão',
            image: 'papeis-papelao.svg'
        },
        {
            title: 'Resíduos electrónicos',
            image: 'eletronicos.svg'
        },
        {
            title: 'Resíduos Orgânicos',
            image: 'organicos.svg'
        },
        {
            title: 'Óleo de Cozinha',
            image: 'oleo.svg'
        },
    ])
}