import { NewExercise } from '../domain/exercise/exercise';
import { ExerciseService } from '../domain/exercise/exercise-service';
import { ExerciseRepository } from '../domain/exercise/repository/exercise-repository';
import { MysqlConnectionPool } from '../repository/mysql/mysql-connection-pool';

MysqlConnectionPool.initialize().then(() => {
    const exerciseRepository = new ExerciseRepository(MysqlConnectionPool.getInstance());
    const exerciseService = new ExerciseService(exerciseRepository);

    const exercises: NewExercise[] = [
        {
            name: 'Push-Up',
            pluralizedName: 'Push-Ups',
            imageUrl: 'assets/slider_pushup.png',
        },
        {
            name: 'Sit-Up',
            pluralizedName: 'Sit-Ups',
            imageUrl: 'assets/slider_situp.png',
        },
        {
            name: 'Squad',
            pluralizedName: 'Squads',
            imageUrl: 'assets/slider_squad.png',
        },
    ];

    exercises.forEach(async exercise => {
        await exerciseService.createExercise(exercise);
        console.log('Created exercise: ' + exercise.name);
    });
});
